import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface CustomGun {
  name: string;
  category: string;
  addedBy?: string;
  addedAt?: string;
}

interface GuildGuns {
  [category: string]: CustomGun[];
}

interface AllGuildsData {
  [guildId: string]: GuildGuns;
}

@Injectable()
export class CustomGunsService {
  private customGunsFile = path.join(process.cwd(), 'data', 'custom-guns.json');
  private customGuns: Map<string, Map<string, CustomGun[]>> = new Map();

  constructor() {
    this.loadCustomGuns();
  }

  private loadCustomGuns() {
    try {
      if (!fs.existsSync(path.dirname(this.customGunsFile))) {
        fs.mkdirSync(path.dirname(this.customGunsFile), { recursive: true });
      }

      if (fs.existsSync(this.customGunsFile)) {
        const data = fs.readFileSync(this.customGunsFile, 'utf-8');
        const parsed: AllGuildsData = JSON.parse(data);
        
        for (const [guildId, guildData] of Object.entries(parsed)) {
          const guildMap = new Map<string, CustomGun[]>();
          for (const [category, guns] of Object.entries(guildData)) {
            guildMap.set(category, guns);
          }
          this.customGuns.set(guildId, guildMap);
        }
      }
    } catch (error) {
      console.error('Error loading custom guns:', error);
      this.customGuns = new Map();
    }
  }

  private saveCustomGuns() {
    try {
      const allGuildsData: AllGuildsData = {};
      
      for (const [guildId, guildMap] of this.customGuns.entries()) {
        const guildData: GuildGuns = {};
        for (const [category, guns] of guildMap.entries()) {
          guildData[category] = guns;
        }
        allGuildsData[guildId] = guildData;
      }
      
      fs.writeFileSync(this.customGunsFile, JSON.stringify(allGuildsData, null, 2));
    } catch (error) {
      console.error('Error saving custom guns:', error);
    }
  }

  private getGuildGuns(guildId: string): Map<string, CustomGun[]> {
    if (!this.customGuns.has(guildId)) {
      this.customGuns.set(guildId, new Map());
    }
    return this.customGuns.get(guildId);
  }

  addGun(guildId: string, category: string, gunName: string, userId?: string): boolean {
    const normalizedCategory = category.toUpperCase();
    const guildGuns = this.getGuildGuns(guildId);
    
    if (!guildGuns.has(normalizedCategory)) {
      guildGuns.set(normalizedCategory, []);
    }

    const guns = guildGuns.get(normalizedCategory);
    
    if (guns.some(g => g.name.toLowerCase() === gunName.toLowerCase())) {
      return false;
    }

    guns.push({
      name: gunName,
      category: normalizedCategory,
      addedBy: userId,
      addedAt: new Date().toISOString(),
    });

    this.saveCustomGuns();
    return true;
  }

  editGun(guildId: string, category: string, oldName: string, newName: string, newCategory?: string): boolean {
    const normalizedCategory = category.toUpperCase();
    const guildGuns = this.getGuildGuns(guildId);
    const guns = guildGuns.get(normalizedCategory);

    if (!guns) {
      return false;
    }

    const gunIndex = guns.findIndex(g => g.name.toLowerCase() === oldName.toLowerCase());
    
    if (gunIndex === -1) {
      return false;
    }

    if (newCategory && newCategory.toUpperCase() !== normalizedCategory) {
      const gun = guns[gunIndex];
      guns.splice(gunIndex, 1);
      
      const targetCategory = newCategory.toUpperCase();
      if (!guildGuns.has(targetCategory)) {
        guildGuns.set(targetCategory, []);
      }
      
      guildGuns.get(targetCategory).push({
        ...gun,
        name: newName,
        category: targetCategory,
      });
    } else {
      guns[gunIndex].name = newName;
    }

    this.saveCustomGuns();
    return true;
  }

  removeGun(guildId: string, category: string, gunName: string): boolean {
    const normalizedCategory = category.toUpperCase();
    const guildGuns = this.getGuildGuns(guildId);
    const guns = guildGuns.get(normalizedCategory);

    if (!guns) {
      return false;
    }

    const gunIndex = guns.findIndex(g => g.name.toLowerCase() === gunName.toLowerCase());
    
    if (gunIndex === -1) {
      return false;
    }

    guns.splice(gunIndex, 1);
    
    if (guns.length === 0) {
      guildGuns.delete(normalizedCategory);
    }

    this.saveCustomGuns();
    return true;
  }

  getGunsByCategory(guildId: string, category: string): CustomGun[] {
    const normalizedCategory = category.toUpperCase();
    const guildGuns = this.getGuildGuns(guildId);
    return guildGuns.get(normalizedCategory) || [];
  }

  getAllCategories(guildId: string): string[] {
    const guildGuns = this.getGuildGuns(guildId);
    return Array.from(guildGuns.keys());
  }

  getAllGuns(guildId: string): CustomGun[] {
    const allGuns: CustomGun[] = [];
    const guildGuns = this.getGuildGuns(guildId);
    guildGuns.forEach(guns => allGuns.push(...guns));
    return allGuns;
  }

  gunExists(guildId: string, category: string, gunName: string): boolean {
    const normalizedCategory = category.toUpperCase();
    const guildGuns = this.getGuildGuns(guildId);
    const guns = guildGuns.get(normalizedCategory);
    
    if (!guns) {
      return false;
    }

    return guns.some(g => g.name.toLowerCase() === gunName.toLowerCase());
  }
}

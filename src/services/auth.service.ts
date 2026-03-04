

import { Injectable, signal } from '@angular/core';

export interface User {
  username: string;
  email: string;
  // FIX: Corrected typo from `password; string` to `password: string`
  password: string; // In a real app, this would be a hash.
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_DB_KEY = 'kruplan_users_db_v1';
  private readonly SESSION_KEY = 'kruplan_session_user_v1';

  currentUser = signal<User | null>(null);

  constructor() {
    this.checkSession();
  }

  private getUsers(): User[] {
    try {
      const usersJson = localStorage.getItem(this.USERS_DB_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (e) {
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(users));
  }
  
  checkSession(): void {
    try {
      const userJson = sessionStorage.getItem(this.SESSION_KEY);
      if (userJson) {
        this.currentUser.set(JSON.parse(userJson));
      }
    } catch (e) {
      this.currentUser.set(null);
    }
  }

  // FIX: Corrected typo in password parameter type from `password; string` to `password: string`
  login(emailOrUsername: string, password: string): { success: boolean, message: string } {
    const users = this.getUsers();
    const user = users.find(u => (u.email.toLowerCase() === emailOrUsername.toLowerCase() || u.username.toLowerCase() === emailOrUsername.toLowerCase()) && u.password === password);

    if (user) {
      this.currentUser.set(user);
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
      return { success: true, message: 'เข้าสู่ระบบสำเร็จ' };
    } else {
      return { success: false, message: 'อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง' };
    }
  }

  loginAsGuest(): void {
    const guestUser: User = {
      username: 'Guest',
      email: 'guest@kruplan.ai', // Use a unique email for guest history
      password: ''
    };
    this.currentUser.set(guestUser);
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(guestUser));
  }

  register(newUser: User): { success: boolean, message: string } {
    const users = this.getUsers();
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      return { success: false, message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' };
    }
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, message: 'ลงทะเบียนสำเร็จ' };
  }

  logout(): void {
    this.currentUser.set(null);
    sessionStorage.removeItem(this.SESSION_KEY);
  }
}
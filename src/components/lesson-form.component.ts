import { Component, input, output, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LessonData } from '../services/gemini.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col bg-white border-r border-slate-200 shadow-sm relative">
      <!-- Header (Sticky on Mobile) -->
      <div class="sticky top-0 z-20 px-6 py-4 border-b border-slate-100 bg-white/95 backdrop-blur shadow-sm flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            สร้างแผน
          </h2>
          <p class="text-xs text-slate-500 mt-0.5 hidden md:block">กรอกข้อมูลเพื่อให้ AI ช่วยร่างแผนการสอน</p>
        </div>

        <div class="flex items-center gap-2">
            <button (click)="openHistory.emit()" class="text-slate-500 hover:text-blue-600 p-2 rounded-full hover:bg-slate-100 transition-colors" title="ประวัติการสร้าง">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </button>
            <button (click)="authService.logout()" class="text-slate-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="ออกจากระบบ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3-3l-3 3m0 0l3 3m-3-3h9" />
                </svg>
            </button>
        </div>
      </div>

      <!-- Form Scrollable Area -->
      <div class="flex-1 p-6 space-y-5 overflow-y-auto">
        <form [formGroup]="lessonForm" class="space-y-4">
          
          <!-- Row 1: Subject & Grade -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">วิชา</label>
              <select formControlName="subject" 
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black appearance-none">
                <option value="" disabled>เลือกวิชา</option>
                @for (subj of subjects; track subj) {
                  <option [value]="subj">{{ subj }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">ระดับชั้น</label>
               <select formControlName="grade" 
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black appearance-none">
                <option value="" disabled>เลือกระดับชั้น</option>
                @for (g of grades; track g) {
                  <option [value]="g">{{ g }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Row 2: Teaching Method -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">รูปแบบการสอน</label>
            <select formControlName="teachingMethod" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black appearance-none">
              @for (method of teachingMethods; track method.name) {
                <option [value]="method.name">{{ method.name }}</option>
              }
            </select>
          </div>

          <!-- Row 3: Teacher & Duration -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อครูผู้สอน</label>
              <input type="text" formControlName="teacher" placeholder="ชื่อ-นามสกุล"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">เวลา (นาที)</label>
              <select formControlName="duration" 
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black">
                <option value="50">50 นาที</option>
                <option value="60">60 นาที (1 ชม.)</option>
                <option value="90">90 นาที (1.5 ชม.)</option>
                <option value="120">120 นาที (2 ชม.)</option>
              </select>
            </div>
          </div>

          <!-- Topic -->
          <div class="relative">
            <label class="block text-sm font-medium text-slate-700 mb-1">หัวข้อ / สาระสำคัญ</label>
            
            <div class="relative">
              <input 
                type="text" 
                formControlName="topic" 
                [placeholder]="topicPlaceholder()"
                (focus)="showTopicDropdown.set(true)"
                (blur)="onTopicBlur()"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-black pr-10">
              
              @if (availableTopics().length > 0) {
                <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                  </svg>
                </div>
              }
            </div>

            @if (showTopicDropdown() && filteredTopics().length > 0) {
              <ul class="absolute z-30 w-full mt-1 max-h-60 overflow-auto bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                @for (t of filteredTopics(); track t) {
                  <li (mousedown)="selectTopic(t)" 
                      class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-slate-700 transition-colors">
                    {{ t }}
                  </li>
                }
              </ul>
            }
          </div>

          <!-- Context -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">บริบทโรงเรียน/นักเรียน</label>
            <textarea formControlName="context" rows="3" placeholder="เช่น นักเรียนเรียนรู้ไว, โรงเรียนมีอุปกรณ์ครบครัน, เน้น Active Learning"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none text-black"></textarea>
          </div>

          <!-- Skills -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">ทักษะที่ต้องการพัฒนา (K-P-A)</label>
            <textarea formControlName="skills" rows="3" placeholder="เช่น การคิดวิเคราะห์, การทำงานเป็นทีม, ความคิดสร้างสรรค์"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none text-black"></textarea>
          </div>

        </form>
      </div>

      <!-- Footer Action (Sticky Bottom on Mobile) -->
      <div class="sticky bottom-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 space-y-3">
        <button 
          (click)="onSubmit()" 
          [disabled]="isLoading() || lessonForm.invalid"
          class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
          @if (isLoading()) {
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังเขียนแผน...
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            สร้างแผนการสอน
          }
        </button>

        <div class="flex gap-2">
          <button 
            type="button"
            (click)="saveDraft()" 
            [disabled]="isLoading()"
            class="flex-1 py-2 px-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm flex justify-center items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            บันทึกแบบร่าง
          </button>
          
          @if (hasDraft()) {
            <button 
              type="button"
              (click)="restoreDraft()" 
              [disabled]="isLoading()"
              class="flex-1 py-2 px-3 bg-white border border-slate-300 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors text-sm flex justify-center items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              เรียกคืนแบบร่าง
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class LessonFormComponent {
  isLoading = input<boolean>(false);
  initialData = input<LessonData | null>(null);
  
  generate = output<LessonData>();
  openHistory = output<void>();

  authService = inject(AuthService);

  lessonForm = new FormGroup({
    subject: new FormControl('', [Validators.required]),
    grade: new FormControl('', [Validators.required]),
    teachingMethod: new FormControl('แบบปกติ (3 ขั้นตอน: นำ-สอน-สรุป)', [Validators.required]),
    teacher: new FormControl(''),
    topic: new FormControl('', [Validators.required]),
    duration: new FormControl('60', [Validators.required]),
    context: new FormControl(''),
    skills: new FormControl('')
  });

  // Convert form value changes to signals for reactivity
  selectedSubject = toSignal(this.lessonForm.controls.subject.valueChanges, { initialValue: '' });
  selectedGrade = toSignal(this.lessonForm.controls.grade.valueChanges, { initialValue: '' });
  topicValue = toSignal(this.lessonForm.controls.topic.valueChanges, { initialValue: '' });
  
  showTopicDropdown = signal(false);

  hasDraft = signal(false);

  constructor() {
    // Check for existing draft
    const draft = localStorage.getItem('lesson_draft');
    if (draft) {
      this.hasDraft.set(true);
    }

    // Restore data from history if provided
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.lessonForm.patchValue(data);
      }
    });
  }

  saveDraft() {
    const data = this.lessonForm.value;
    localStorage.setItem('lesson_draft', JSON.stringify(data));
    this.hasDraft.set(true);
    alert('บันทึกแบบร่างเรียบร้อยแล้ว');
  }

  restoreDraft() {
    const draft = localStorage.getItem('lesson_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        this.lessonForm.patchValue(data);
        alert('เรียกคืนแบบร่างเรียบร้อยแล้ว');
      } catch (e) {
        console.error('Error parsing draft', e);
      }
    }
  }

  filteredTopics = computed(() => {
    const all = this.availableTopics();
    const search = this.topicValue()?.toLowerCase() || '';
    if (!search) return all;
    return all.filter(t => t.toLowerCase().includes(search));
  });

  selectTopic(topic: string) {
    this.lessonForm.controls.topic.setValue(topic);
    this.showTopicDropdown.set(false);
  }

  onTopicBlur() {
    // Small delay to allow mousedown to fire first if clicking an option
    setTimeout(() => {
      this.showTopicDropdown.set(false);
    }, 200);
  }

  // Lists
  subjects = [
    'ภาษาไทย', 'คณิตศาสตร์', 'วิทยาศาสตร์และเทคโนโลยี', 
    'สังคมศึกษา ศาสนา และวัฒนธรรม', 'ประวัติศาสตร์',
    'สุขศึกษาและพลศึกษา', 'ศิลปะ (ทัศนศิลป์/ดนตรี/นาฏศิลป์)', 
    'การงานอาชีพ', 'ภาษาอังกฤษ', 'วิทยาการคำนวณ', 'แนะแนว'
  ];

  grades = [
    'ปฐมวัย / อนุบาล',
    'ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2', 'ประถมศึกษาปีที่ 3', 
    'ประถมศึกษาปีที่ 4', 'ประถมศึกษาปีที่ 5', 'ประถมศึกษาปีที่ 6',
    'มัธยมศึกษาปีที่ 1', 'มัธยมศึกษาปีที่ 2', 'มัธยมศึกษาปีที่ 3',
    'มัธยมศึกษาปีที่ 4', 'มัธยมศึกษาปีที่ 5', 'มัธยมศึกษาปีที่ 6',
    'ปวช.', 'ปวส.'
  ];
  
  teachingMethods = [
    { name: 'แบบปกติ (3 ขั้นตอน: นำ-สอน-สรุป)' },
    { name: 'สืบเสาะหาความรู้ (5E Inquiry-Based Learning)' },
    { name: 'Active Learning (เน้นการปฏิบัติ)' },
    { name: 'การเรียนรู้โดยใช้ปัญหาเป็นฐาน (Problem-Based Learning - PBL)' },
    { name: 'การเรียนรู้โดยใช้โครงงานเป็นฐาน (Project-Based Learning - PjBL)' },
    { name: 'การจัดการเรียนรู้โดยใช้เกมเป็นฐาน (Game-Based Learning - GBL)' },
    { name: 'Gamification (การใช้กลไกเกม)' },
    { name: 'การเรียนรู้แบบร่วมมือ (Co-operative Learning)' },
    { name: 'TGT (Team Games Tournament)' },
    { name: 'STAD (Student Teams-Achievement Divisions)' },
    { name: '4MAT (วัฏจักรการเรียนรู้ 4 แบบ)' },
    { name: 'ห้องเรียนกลับด้าน (Flipped Classroom)' }
  ];

  availableTopics = computed(() => {
     return this.getCurriculumTopics(this.selectedSubject(), this.selectedGrade());
  });

  topicPlaceholder = computed(() => {
    const subj = this.selectedSubject();
    if (!subj) return 'เช่น ชื่อหน่วยการเรียนรู้ หรือหัวข้อที่ต้องการสอน';
    switch (subj) {
      case 'คณิตศาสตร์': return 'เช่น เศษส่วน, สมการเชิงเส้น';
      case 'วิทยาศาสตร์และเทคโนโลยี': return 'เช่น ระบบสุริยะ, แรงและการเคลื่อนที่';
      case 'ภาษาไทย': return 'เช่น การอ่านจับใจความ, กาพย์ยานี ๑๑';
      case 'ภาษาอังกฤษ': return 'เช่น Present Simple Tense';
      case 'สังคมศึกษา ศาสนา และวัฒนธรรม': return 'เช่น เศรษฐกิจพอเพียง, ภูมิศาสตร์ไทย';
      default: return 'เช่น ชื่อหน่วยการเรียนรู้';
    }
  });

  // Database of Curriculum Topics (Updated from Official Thai Curriculum Documents)
  getCurriculumTopics(subject: string | null, grade: string | null): string[] {
    if (!subject || !grade) return [];

    if (subject === 'ภาษาไทย') {
      if (grade.includes('ประถมศึกษาปีที่ 1')) return ['พยัญชนะ สระ และวรรณยุกต์', 'การสะกดคำและแจกลูก', 'มาตราตัวสะกด (แม่ ก กา)', 'การผันวรรณยุกต์อักษรกลาง', 'การแต่งประโยคง่ายๆ', 'นิทานและเพลงกล่อมเด็ก'];
      if (grade.includes('ประถมศึกษาปีที่ 2')) return ['คำควบกล้ำ', 'อักษรนำ', 'มาตราตัวสะกด (เพิ่ม แม่ กน กม เกย เกอว)', 'การผันวรรณยุกต์อักษรสูงและต่ำ', 'คำที่มีความหมายตรงข้าม', 'การเขียนเรื่องสั้นจากภาพ'];
      if (grade.includes('ประถมศึกษาปีที่ 3')) return ['คำที่ใช้ บัน บรร รร', 'คำพ้องรูป คำพ้องเสียง', 'ประโยคเพื่อการสื่อสาร (บอกเล่า คำถาม ปฏิเสธ ขอร้อง)', 'การเขียนจดหมายลาครู', 'การย่อความจากนิทาน', 'สำนวนไทยเบื้องต้น'];
      if (grade.includes('ประถมศึกษาปีที่ 4')) return ['ชนิดของคำ (นาม สรรพนาม กริยา)', 'คำวิเศษณ์', 'กลอนสี่', 'การเขียนแผนภาพโครงเรื่อง', 'การเขียนจดหมายถึงเพื่อนและบิดามารดา', 'การอ่านแผนภูมิและตาราง'];
      if (grade.includes('ประถมศึกษาปีที่ 5')) return ['คำบุพบท คำสันธาน คำอุทาน', 'ประโยคความเดียวและความรวม', 'ราชาศัพท์เบื้องต้น', 'กาพย์ยานี ๑๑', 'การเขียนแสดงความรู้สึกและจินตนาการ', 'การกรอกแบบรายการ'];
      if (grade.includes('ประถมศึกษาปีที่ 6')) return ['ประโยคความซ้อน', 'คำภาษาต่างประเทศในภาษาไทย', 'ระดับภาษา', 'โคลงสี่สุภาพ', 'การเขียนเรียงความและย่อความ', 'การพูดรายงาน'];
      if (grade.includes('มัธยมศึกษาปีที่ 1')) return ['เสียงในภาษาไทย', 'การสร้างคำ (คำมูล คำประสม คำซ้ำ คำซ้อน)', 'นิราศภูเขาทอง', 'โคลงโลกนิติ', 'การอ่านจับใจความ', 'การเขียนบรรยายและพรรณนา'];
      if (grade.includes('มัธยมศึกษาปีที่ 2')) return ['ประโยคชนิดต่างๆ', 'กลอนสุภาพ', 'บทเสภาสามัคคีเสวก', 'โคลงภาพพระราชพงศาวดาร', 'การพูดวิเคราะห์และวิจารณ์', 'การเขียนจดหมายกิจธุระ'];
      if (grade.includes('มัธยมศึกษาปีที่ 3')) return ['คำทับศัพท์และศัพท์บัญญัติ', 'ประโยคซับซ้อน', 'พระอภัยมณี ตอน พระอภัยมณีหนีนางผีเสื้อ', 'บทพากย์เอราวัณ', 'อิศรญาณภาษิต', 'การเขียนรายงานโครงงาน'];
      if (grade.includes('มัธยมศึกษาปีที่ 4')) return ['ธรรมชาติของภาษาและพลังของภาษา', 'การอ่านตีความและประเมินค่า', 'หลักการเขียนเรียงความและย่อความชั้นสูง', 'มหาเวสสันดรชาดก กัณฑ์มัทรี', 'ลิลิตตะเลงพ่าย', 'หลักการแต่งคำประพันธ์ (กาพย์ โคลง)'];
      if (grade.includes('มัธยมศึกษาปีที่ 5')) return ['การใช้ภาษาแสดงทรรศนะและโต้แย้ง', 'การวิเคราะห์และประเมินค่าสาร', 'การเขียนบทความและสารคดี', 'มหาเวสสันดรชาดก กัณฑ์กุมาร', 'ลิลิตพระลอ', 'การแต่งคำประพันธ์ (ร่าย ฉันท์)'];
      if (grade.includes('มัธยมศึกษาปีที่ 6')) return ['อิทธิพลของภาษาต่างประเทศและภาษาถิ่น', 'การพูดในที่ประชุมชน', 'การเขียนจดหมายสมัครงาน', 'เสภาเรื่องขุนช้างขุนแผน', 'สามก๊ก ตอน กวนอูไปรับราชการกับโจโฉ', 'การประเมินคุณค่าวรรณคดีและวรรณกรรม'];
    }
    
    if (subject === 'คณิตศาสตร์') {
      if (grade.includes('ประถมศึกษาปีที่ 1')) return ['จำนวนนับ 1 ถึง 100 และ 0', 'การบวก การลบ จำนวนนับ', 'รูปเรขาคณิตสองมิติและสามมิติ', 'การวัดความยาวและน้ำหนัก', 'แบบรูปของจำนวน'];
      if (grade.includes('ประถมศึกษาปีที่ 2')) return ['จำนวนนับไม่เกิน 1,000 และ 0', 'การบวก ลบ คูณ หาร จำนวนนับ', 'การวัดความยาว น้ำหนัก และปริมาตร', 'เวลา', 'รูปเรขาคณิตและแบบรูป'];
      if (grade.includes('ประถมศึกษาปีที่ 3')) return ['จำนวนนับไม่เกิน 100,000', 'เศษส่วน', 'การวัดความยาว น้ำหนัก ปริมาตร และเวลา', 'การเก็บรวบรวมและนำเสนอข้อมูล', 'แบบรูปของจำนวน'];
      if (grade.includes('ประถมศึกษาปีที่ 4')) return ['จำนวนนับที่มากกว่า 100,000', 'เศษส่วน', 'ทศนิยมไม่เกิน 2 ตำแหน่ง', 'มุมและเส้นขนาน', 'รูปสี่เหลี่ยมมุมฉาก', 'การนำเสนอข้อมูล (แผนภูมิแท่ง)'];
      if (grade.includes('ประถมศึกษาปีที่ 5')) return ['เศษส่วนและการเปรียบเทียบ', 'ทศนิยมและการเปรียบเทียบ', 'ร้อยละและอัตราส่วน', 'บัญญัติไตรยางศ์', 'รูปสี่เหลี่ยมและปริมาตร', 'สถิติและความน่าจะเป็นเบื้องต้น'];
      if (grade.includes('ประถมศึกษาปีที่ 6')) return ['ห.ร.ม. และ ค.ร.น.', 'เศษส่วน ทศนิยม และการประยุกต์', 'อัตราส่วนและร้อยละ', 'แบบรูปและความสัมพันธ์', 'รูปเรขาคณิตสามมิติ', 'การนำเสนอข้อมูล (แผนภูมิวงกลม)'];
      if (grade.includes('มัธยมศึกษาปีที่ 1')) return ['จำนวนเต็ม', 'เลขยกกำลัง', 'ทศนิยมและเศษส่วน', 'การสร้างทางเรขาคณิต', 'สมการเชิงเส้นตัวแปรเดียว', 'อัตราส่วน สัดส่วน และร้อยละ'];
      if (grade.includes('มัธยมศึกษาปีที่ 2')) return ['ทฤษฎีบทพีทาโกรัส', 'จำนวนจริง', 'พหุนามและการแยกตัวประกอบ', 'การแปลงทางเรขาคณิต (เลื่อนขนาน สะท้อน หมุน)', 'ความเท่ากันทุกประการ', 'เส้นขนาน'];
      if (grade.includes('มัธยมศึกษาปีที่ 3')) return ['อสมการเชิงเส้นตัวแปรเดียว', 'สมการกำลังสองตัวแปรเดียว', 'ฟังก์ชันกำลังสองและกราฟ', 'ระบบสมการเชิงเส้นสองตัวแปร', 'วงกลมและความคล้าย', 'สถิติและความน่าจะเป็น'];
      if (grade.includes('มัธยมศึกษาปีที่ 4')) return ['เซตและตรรกศาสตร์', 'จำนวนจริงและพหุนาม', 'ฟังก์ชันและกราฟ', 'ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม', 'เรขาคณิตวิเคราะห์และภาคตัดกรวย'];
      if (grade.includes('มัธยมศึกษาปีที่ 5')) return ['ฟังก์ชันตรีโกณมิติ', 'เมทริกซ์', 'เวกเตอร์ในสามมิติ', 'จำนวนเชิงซ้อน', 'หลักการนับเบื้องต้นและความน่าจะเป็น'];
      if (grade.includes('มัธยมศึกษาปีที่ 6')) return ['ลำดับและอนุกรม', 'แคลคูลัสเบื้องต้น', 'สถิติและการแจกแจงความน่าจะเป็น', 'ตัวแปรสุ่มและการแจกแจงทวินาม', 'กำหนดการเชิงเส้น'];
    }

    if (subject === 'วิทยาศาสตร์และเทคโนโลยี') {
      if (grade.includes('ประถมศึกษาปีที่ 1')) return ['ตัวเรา พืช และสัตว์รอบตัว', 'ของเล่นและของใช้', 'หินในธรรมชาติ', 'ท้องฟ้าและดาว'];
      if (grade.includes('ประถมศึกษาปีที่ 2')) return ['วัฏจักรชีวิตของพืชดอก', 'วัสดุรอบตัวเรา (สมบัติและการใช้ประโยชน์)', 'แสงและการมองเห็น', 'ดินและการใช้ประโยชน์'];
      if (grade.includes('ประถมศึกษาปีที่ 3')) return ['ปัจจัยในการดำรงชีวิตของมนุษย์และสัตว์', 'การเปลี่ยนแปลงของวัสดุ', 'แรงและการเคลื่อนที่', 'พลังงานไฟฟ้า', 'อากาศและความสำคัญต่อสิ่งมีชีวิต'];
      if (grade.includes('ประถมศึกษาปีที่ 4')) return ['การจำแนกสิ่งมีชีวิต', 'ส่วนประกอบและหน้าที่ของพืชดอก', 'สถานะของสสาร', 'แรงโน้มถ่วงและแรงเสียดทาน', 'ระบบสุริยะและปรากฏการณ์ทางดาราศาสตร์'];
      if (grade.includes('ประถมศึกษาปีที่ 5')) return ['โซ่อาหารและสายใยอาหาร', 'การเปลี่ยนแปลงของสาร (กายภาพและเคมี)', 'แรงลัพธ์และแรงเสียดทาน', 'เสียงและการได้ยิน', 'วัฏจักรน้ำและปรากฏการณ์ลมฟ้าอากาศ'];
      if (grade.includes('ประถมศึกษาปีที่ 6')) return ['สารอาหารและระบบย่อยอาหาร', 'การแยกสารเนื้อผสม', 'วงจรไฟฟ้าอย่างง่าย', 'ปรากฏการณ์ทางธรณีวิทยา (แผ่นดินไหว, สึนามิ)', 'ปรากฏการณ์ดาราศาสตร์ (อุปราคา)', 'เทคโนโลยีอวกาศ'];
      if (grade.includes('มัธยมศึกษาปีที่ 1')) return ['สารบริสุทธิ์และสารละลาย', 'หน่วยพื้นฐานของสิ่งมีชีวิต (เซลล์)', 'การลำเลียงสารเข้าออกจากเซลล์', 'การดำรงชีวิตของพืช (การสังเคราะห์ด้วยแสง)', 'พลังงานความร้อน', 'บรรยากาศของโลก'];
      if (grade.includes('มัธยมศึกษาปีที่ 2')) return ['ระบบต่างๆ ในร่างกายมนุษย์', 'การจำแนกสารและการเปลี่ยนแปลงทางเคมี', 'การเคลื่อนที่และแรง', 'งานและพลังงาน', 'โลกและการเปลี่ยนแปลงทางธรณีวิทยา', 'ทรัพยากรธรณี'];
      if (grade.includes('มัธยมศึกษาปีที่ 3')) return ['ปฏิสัมพันธ์ในระบบสุริยะ', 'พันธุกรรมและความหลากหลายทางชีวภาพ', 'ปฏิกิริยาเคมีและวัสดุในชีวิตประจำวัน', 'ไฟฟ้าและอิเล็กทรอนิกส์เบื้องต้น', 'คลื่นและแสง', 'ระบบนิเวศ'];
      if (grade.includes('มัธยมศึกษาปีที่ 4')) return ['ชีววิทยา: ธรรมชาติของสิ่งมีชีวิต, เคมีพื้นฐานของสิ่งมีชีวิต, เซลล์', 'เคมี: อะตอมและตารางธาตุ, พันธะเคมี', 'ฟิสิกส์: ธรรมชาติและพัฒนาการทางฟิสิกส์, การเคลื่อนที่แนวตรง, แรงและกฎการเคลื่อนที่'];
      if (grade.includes('มัธยมศึกษาปีที่ 5')) return ['ชีววิทยา: ระบบย่อยอาหาร, ระบบหมุนเวียนเลือดและภูมิคุ้มกัน', 'เคมี: ปริมาณสารสัมพันธ์, ของแข็ง ของเหลว แก๊ส, สมดุลเคมี', 'ฟิสิกส์: สมดุลกล, งานและพลังงาน, คลื่นกล, แสงและเสียง'];
      if (grade.includes('มัธยมศึกษาปีที่ 6')) return ['ชีววิทยา: การถ่ายทอดทางพันธุกรรม, วิวัฒนาการ, ความหลากหลายทางชีวภาพ', 'เคมี: กรด-เบส, ไฟฟ้าเคมี', 'ฟิสิกส์: ไฟฟ้ากระแสสลับ, คลื่นแม่เหล็กไฟฟ้า', 'โลก ดาราศาสตร์ และอวกาศ: เอกภพ'];
    }

    if (subject === 'ภาษาอังกฤษ') {
      if (grade.includes('ประถมศึกษาปีที่ 1')) return ['Alphabet and Phonics', 'Greetings and Introductions', 'Numbers, Colors, Shapes', 'My Body and My Family', 'Animals and Things'];
      if (grade.includes('ประถมศึกษาปีที่ 2')) return ['Classroom Objects', 'Food and Drinks', 'Daily Routines', 'Giving Simple Commands', 'Describing People and Things'];
      if (grade.includes('ประถมศึกษาปีที่ 3')) return ['Places in Town', 'Jobs and Occupations', 'Telling Time', 'Present Continuous Tense', 'Festivals and Holidays'];
      if (grade.includes('ประถมศึกษาปีที่ 4')) return ['Free Time Activities', 'Shopping for Food', 'Health and Sickness', 'Past Simple Tense (was/were, regular verbs)', 'Reading Simple Stories'];
      if (grade.includes('ประถมศึกษาปีที่ 5')) return ['Asking for and Giving Directions', 'My Favorite Subjects', 'Future Simple (will/going to)', 'Comparisons (adjectives)', 'Reading for Main Ideas'];
      if (grade.includes('ประถมศึกษาปีที่ 6')) return ['My Dreams and Ambitions', 'My Country and Culture', 'Rules and Obligations (must/mustn\'t)', 'Reading and Summarizing Short Texts', 'Writing a Simple Postcard'];
      if (grade.includes('มัธยมศึกษาปีที่ 1')) return ['Personal Information', 'School Life and Subjects', 'Hobbies and Interests', 'Present Simple and Adverbs of Frequency', 'Reading for Specific Information'];
      if (grade.includes('มัธยมศึกษาปีที่ 2')) return ['Travel and Holidays', 'Past Simple and Past Continuous', 'Giving Advice (should/shouldn\'t)', 'Reading Articles and Blogs', 'Writing a Short Paragraph'];
      if (grade.includes('มัธยมศึกษาปีที่ 3')) return ['Technology and Gadgets', 'Present Perfect Tense', 'Passive Voice (Simple Tenses)', 'Conditional Sentences (Type 1)', 'Reading and Understanding News Headlines'];
      if (grade.includes('มัธยมศึกษาปีที่ 4')) return ['Relationships', 'Education and Future Plans', 'Conditional Sentences (Type 1 & 2)', 'Reading for Gist and Detail in Longer Texts', 'Writing Formal and Informal Emails'];
      if (grade.includes('มัธยมศึกษาปีที่ 5')) return ['Social Issues', 'Environment and Conservation', 'Reported Speech', 'Reading Academic Texts', 'Writing an Opinion Essay'];
      if (grade.includes('มัธยมศึกษาปีที่ 6')) return ['World Events and News', 'Career and Job Applications', 'Advanced Grammar Structures (e.g., all conditionals, passive voice)', 'Critical Reading and Analysis', 'Writing a Formal Report or Proposal'];
    }

    if (subject === 'สังคมศึกษา ศาสนา และวัฒนธรรม') {
      if (grade.includes('ประถมศึกษาปีที่ 1')) return ['สิ่งแวดล้อมรอบตัว', 'ความสัมพันธ์ของตำแหน่ง ระยะ ทิศ', 'การเป็นพลเมืองดีในครอบครัวและโรงเรียน', 'สินค้าและบริการในชีวิตประจำวัน', 'พุทธประวัติเบื้องต้น'];
      if (grade.includes('ประถมศึกษาปีที่ 2')) return ['ชุมชนของเรา', 'การประกอบอาชีพในชุมชน', 'วัฒนธรรมและประเพณีไทย', 'สิทธิและหน้าที่ของตนเอง', 'ปรากฏการณ์ทางธรรมชาติ (โลก ดวงอาทิตย์ ดวงจันทร์)'];
      if (grade.includes('ประถมศึกษาปีที่ 3')) return ['แผนผังและแผนที่', 'สิ่งแวดล้อมและการเปลี่ยนแปลงในชุมชน', 'การเมืองการปกครองระดับท้องถิ่น', 'ภาษีและสหกรณ์', 'วันสำคัญทางศาสนา'];
      if (grade.includes('ประถมศึกษาปีที่ 4')) return ['ลักษณะทางกายภาพของจังหวัด', 'ทรัพยากรในจังหวัด', 'ประวัติศาสตร์สมัยสุโขทัย', 'เศรษฐกิจพอเพียง', 'การเป็นพลเมืองดีในสังคม'];
      if (grade.includes('ประถมศึกษาปีที่ 5')) return ['ภูมิภาคของไทย', 'สิทธิมนุษยชน', 'สถาบันการเงิน (ธนาคาร)', 'ประวัติศาสตร์สมัยอยุธยา', 'หลักธรรมทางศาสนาเพื่อการอยู่ร่วมกัน'];
      if (grade.includes('ประถมศึกษาปีที่ 6')) return ['เครื่องมือทางภูมิศาสตร์ (แผนที่, ลูกโลก)', 'ภัยพิบัติทางธรรมชาติในประเทศไทย', 'ความสัมพันธ์ทางเศรษฐกิจระหว่างประเทศเบื้องต้น', 'ประวัติศาสตร์สมัยรัตนโกสินทร์ตอนต้น', 'ศาสนาต่างๆ ในประเทศไทย'];
      if (grade.includes('มัธยมศึกษาปีที่ 1')) return ['เครื่องมือทางภูมิศาสตร์และเทคโนโลยี', 'ทวีปเอเชีย', 'หน้าที่พลเมืองและกฎหมายในชีวิตประจำวัน', 'เศรษฐศาสตร์เบื้องต้น (อุปสงค์ อุปทาน)', 'พุทธประวัติและหลักธรรม'];
      if (grade.includes('มัธยมศึกษาปีที่ 2')) return ['ทวีปยุโรปและแอฟริกา', 'รัฐธรรมนูญและการเมืองการปกครองไทย', 'ระบบเศรษฐกิจและสถาบันทางเศรษฐกิจ', 'พัฒนาการของอาณาจักรอยุธยาและธนบุรี', 'กฎหมายในชีวิตประจำวัน'];
      if (grade.includes('มัธยมศึกษาปีที่ 3')) return ['ทวีปอเมริกาเหนือและอเมริกาใต้', 'ออสเตรเลียและโอเชียเนีย', 'เศรษฐกิจระหว่างประเทศ', 'เหตุการณ์สำคัญในสมัยรัตนโกสินทร์', 'ความร่วมมือระหว่างประเทศ'];
      if (grade.includes('มัธยมศึกษาปีที่ 4')) return ['ภูมิศาสตร์กายภาพและเครื่องมือทางภูมิศาสตร์', 'ภัยพิบัติทางธรรมชาติ', 'ปัญหาสิ่งแวดล้อมและการจัดการ', 'รัฐกับการเมืองการปกครอง', 'เศรษฐกิจโลกและโลกาภิวัตน์'];
      if (grade.includes('มัธยมศึกษาปีที่ 5')) return ['ภูมิศาสตร์มนุษย์', 'การตั้งถิ่นฐานและประชากร', 'กฎหมายระหว่างประเทศ', 'องค์การความร่วมมือระหว่างประเทศ', 'วัฒนธรรมไทยและวัฒนธรรมสากล'];
      if (grade.includes('มัธยมศึกษาปีที่ 6')) return ['การจัดการทรัพยากรธรรมชาติและสิ่งแวดล้อมอย่างยั่งยืน', 'ภูมิรัฐศาสตร์ (Geopolitics)', 'วิกฤตการณ์ของโลก', 'แนวทางการพัฒนาที่ยั่งยืน (SDGs)', 'การเป็นพลเมืองโลก (Global Citizen)'];
    }
    
    return [];
  }

  onSubmit() {
    if (this.lessonForm.valid) {
      this.generate.emit(this.lessonForm.value as LessonData);
    }
  }
}

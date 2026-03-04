import { Component, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlideContent } from '../services/gemini.service';

@Component({
  selector: 'app-slides-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-white">
      <!-- Toolbar -->
      <div class="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm no-print z-10 sticky top-0 md:relative">
        <div class="flex items-center gap-2">
           <button (click)="backToPlan.emit()" class="flex items-center gap-2 px-3 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 rounded-md text-sm font-medium transition-colors shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
               <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
             </svg>
             <span>กลับไปที่แผน</span>
           </button>
        </div>
        
        <div class="flex items-center gap-2">
           <a href="https://notebooklm.google/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 px-3 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 rounded-md text-sm font-medium transition-colors shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-blue-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
             </svg>
             <span class="hidden sm:inline">NotebookLM</span>
           </a>
           <button (click)="copyAll()" [disabled]="!editableSlides() || editableSlides()?.length === 0" class="flex items-center gap-2 px-3 py-2 text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m9.375 0a9.06 9.06 0 00-1.5-.124M9.375 7.875c0-1.036.84-1.875 1.875-1.875h3.375c1.036 0 1.875.84 1.875 1.875v1.5m-7.5 0h7.5"/>
             </svg>
             <span>คัดลอกทั้งหมด</span>
           </button>
        </div>
      </div>
      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
        @if (isLoading()) {
          <div class="flex items-center justify-center text-slate-500">
            <svg class="animate-spin h-6 w-6 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังสร้างสไลด์...
          </div>
        } @else if (editableSlides() && editableSlides().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (slide of editableSlides(); track slide.slideNumber; let i = $index) {
              <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col space-y-3 transition-all hover:shadow-lg">
                <p class="font-bold text-sm text-blue-600">สไลด์ที่ {{ slide.slideNumber }}</p>
                <div class="flex flex-col">
                  <label class="text-xs font-semibold text-slate-600 mb-1">หัวข้อ</label>
                  <textarea [(ngModel)]="slide.title" (ngModelChange)="updateSlide(i, 'title', $event)" rows="2" class="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex flex-col">
                  <label class="text-xs font-semibold text-slate-600 mb-1">เนื้อหา (ใช้ - นำหน้า)</label>
                  <textarea [(ngModel)]="slide.content" (ngModelChange)="updateSlide(i, 'content', $event)" rows="5" class="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex flex-col">
                  <label class="text-xs font-semibold text-slate-600 mb-1">ไอเดียการออกแบบ</label>
                  <textarea [(ngModel)]="slide.designNotes" (ngModelChange)="updateSlide(i, 'designNotes', $event)" rows="2" class="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                </div>
              </div>
            }
          </div>
        } @else {
           <div class="flex flex-col items-center justify-center text-slate-400 mt-20">
             <p class="text-lg font-medium text-slate-600">ไม่พบข้อมูลสไลด์</p>
             <p class="text-sm">กรุณาสร้างแผนการสอนก่อน แล้วกดปุ่ม "สร้างสไลด์"</p>
          </div>
        }
      </div>
    </div>
  `
})
export class SlidesGeneratorComponent {
  slides = input<SlideContent[] | null>(null);
  isLoading = input<boolean>(false);
  backToPlan = output<void>();

  editableSlides = signal<SlideContent[]>([]);

  constructor() {
    effect(() => {
      const newSlides = this.slides();
      this.editableSlides.set(newSlides ? JSON.parse(JSON.stringify(newSlides)) : []);
    });
  }

  updateSlide(index: number, field: keyof SlideContent, value: string) {
    this.editableSlides.update(slides => {
      const slideToUpdate = slides[index];
      if (slideToUpdate) {
        (slideToUpdate as any)[field] = value;
      }
      return [...slides];
    });
  }
  
  copyAll() {
    const slides = this.editableSlides();
    if (!slides || slides.length === 0) return;

    const formattedText = slides
      .map(slide => {
        return `// สไลด์ที่ ${slide.slideNumber}\n## ${slide.title}\n\n${slide.content}\n\n**ไอเดียการออกแบบ:** ${slide.designNotes}`;
      })
      .join('\n\n---\n\n');

    navigator.clipboard.writeText(formattedText).then(() => {
      alert('คัดลอกเนื้อหาสไลด์ทั้งหมดเรียบร้อยแล้ว');
    }, () => {
      alert('ไม่สามารถคัดลอกได้');
    });
  }
}

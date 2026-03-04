import { Component, input, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-lesson-preview',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
      /* On mobile, height is auto (grows with content). On desktop, it's 100% */
      height: 100%; 
    }

    /* Document View Styles */
    .document-paper {
      font-family: 'TH Sarabun New', 'Sarabun', sans-serif;
    }

    /* Print Specific Styles */
    @media print {
      @page {
        size: A4;
        margin: 20mm;
      }

      body {
        background: white;
        margin: 0;
        padding: 0;
        font-family: 'TH Sarabun New', 'Sarabun', sans-serif;
      }

      .no-print {
        display: none !important;
      }

      #print-area {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        box-shadow: none !important;
        border: none !important;
        max-width: none !important; /* Allow full width print */
      }
      
      /* Reset overflow for the scroll container */
      .print-scroll-reset {
        overflow: visible !important;
        height: auto !important;
      }
    }
  `],
  template: `
    <div class="h-full flex flex-col bg-white">
      <!-- Toolbar -->
      <div class="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm no-print z-10 sticky top-0 md:relative">
        <div class="flex items-center gap-2">
           <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">แผนการสอน</span>
        </div>
        
        <div class="flex items-center gap-2">
           <!-- Edit Button -->
           <button (click)="edit.emit()" [disabled]="!content()" class="flex items-center gap-2 px-3 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-800 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
               <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
             </svg>
             <span class="hidden sm:inline">แก้ไข</span>
           </button>

           <!-- Word Button -->
           <button (click)="downloadWord()" [disabled]="!content()" class="flex items-center gap-2 px-3 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-blue-600">
               <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
             </svg>
             <span class="hidden sm:inline">Word</span>
           </button>
          
           <div class="h-6 w-px bg-slate-200 mx-1"></div>

           <!-- Worksheet Generator Button -->
           <button (click)="generateActivities.emit()" [disabled]="!content() || isLoading()" class="flex items-center gap-2 px-3 py-2 text-slate-700 bg-white border border-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-blue-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
             <span class="hidden sm:inline">สร้างใบงาน</span>
           </button>

           <!-- Slide Generator Button -->
           <button (click)="generateSlides.emit()" [disabled]="!content() || isLoading()" class="flex items-center gap-2 px-3 py-2 text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-3.375v3.375m3-5.625v5.625m3-8.25v8.25M3 3h18M3 12h18m-9 9h9" />
              </svg>
             <span class="hidden sm:inline">สร้างสไลด์</span>
           </button>
        </div>
      </div>

      <!-- Document Viewer -->
      <!-- Added min-h-[500px] on mobile to make sure it feels like a substantial section -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-white print:bg-white print:p-0 print:block print-scroll-reset min-h-[50vh] md:min-h-0">
        @if (isLoading()) {
          <div class="w-full max-w-3xl bg-white rounded-lg shadow-sm border border-slate-300 animate-pulse p-8 space-y-4 mx-auto">
             <div class="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-8"></div>
             
             <div class="space-y-4">
               <div class="h-4 bg-slate-200 rounded w-3/4"></div>
               <div class="h-4 bg-slate-200 rounded w-full"></div>
               <div class="h-4 bg-slate-200 rounded w-full"></div>
               <div class="h-4 bg-slate-200 rounded w-5/6"></div>
             </div>
             
             <div class="space-y-4 pt-10">
               <div class="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
               <div class="h-24 bg-slate-200 rounded w-full"></div>
             </div>
          </div>
        } 
        
        @if (!isLoading() && content()) {
          <!-- Continuous Paper Container (Fluid Height) -->
          <div id="print-area" class="document-paper w-full max-w-3xl bg-white p-8 md:p-12 text-black leading-relaxed mx-auto transition-all">
             <!-- Render HTML safely. -->
             <div class="prose max-w-none prose-headings:font-bold prose-headings:text-black prose-p:text-black prose-li:text-black prose-table:border-collapse prose-td:border prose-td:border-black prose-td:p-2 prose-th:border prose-th:border-black prose-th:bg-slate-50 prose-th:text-black prose-th:p-2 prose-strong:text-black" [innerHTML]="safeContent()"></div>
          </div>
        }

        @if (!isLoading() && !content()) {
          <div class="flex flex-col items-center justify-center text-slate-400 mt-20">
             <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-blue-500">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
               </svg>
             </div>
             <p class="text-lg font-medium text-slate-600">พร้อมสร้างแผนการสอน</p>
             <p class="text-sm">เลือกวิชาและระดับชั้นทางซ้ายมือได้เลย</p>
          </div>
        }
      </div>
    </div>
  `
})
export class LessonPreviewComponent {
  content = input<string | null>(null);
  isLoading = input<boolean>(false);
  generateSlides = output<void>();
  generateActivities = output<void>();
  edit = output<void>();
  
  private sanitizer: DomSanitizer = inject(DomSanitizer);

  safeContent = computed(() => {
    const raw = this.content();
    if (!raw) return '';
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  });

  copyToClipboard() {
    const text = document.getElementById('print-area')?.innerText;
    if (text) {
      navigator.clipboard.writeText(text);
      alert('คัดลอกเนื้อหาเรียบร้อยแล้ว');
    }
  }

  downloadWord() {
    const content = this.content();
    if (!content) return;

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Lesson Plan</title>
        <style>
          @font-face {
            font-family: 'TH Sarabun New';
            src: local('TH Sarabun New'), local('THSarabunNew');
          }
          body { 
            font-family: 'TH Sarabun New', 'Sarabun', sans-serif; 
            font-size: 16pt; 
            color: #000000; 
            line-height: 1.2;
          }
          h1, h2, h3, h4, h5, h6 { 
            font-size: 18pt; 
            font-weight: bold; 
            margin-top: 10px;
            margin-bottom: 5px;
          }
          p, li, span, div, td, th { 
            font-size: 16pt; 
          }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #000; }
          th { border: 1px solid #000; padding: 5px; background-color: #f0f0f0; font-weight: bold; text-align: left; }
          td { border: 1px solid #000; padding: 5px; vertical-align: top; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          ul, ol { margin: 0; padding-left: 25px; }
          li { margin-bottom: 0; }
        </style>
      </head>
      <body>
    `;
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Lesson_Plan.doc'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

}
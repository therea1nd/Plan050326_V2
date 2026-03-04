import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-activity-generator',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
      height: 100%; 
    }
    .document-paper {
      font-family: 'TH Sarabun New', 'Sarabun', sans-serif;
    }
  `],
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
           <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">ใบงาน/กิจกรรม</span>
        </div>
        
        <div class="flex items-center gap-2">
           <button (click)="downloadWord()" [disabled]="!content() || isLoading()" class="flex items-center gap-2 px-3 py-2 text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
               <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
             </svg>
             <span>ดาวน์โหลด Word</span>
           </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-white">
        @if (isLoading()) {
          <div class="flex items-center justify-center text-slate-500">
            <svg class="animate-spin h-6 w-6 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            กำลังสร้างใบงาน...
          </div>
        } @else if (content()) {
          <div class="document-paper w-full max-w-3xl bg-white p-8 md:p-12 text-black leading-relaxed mx-auto">
             <div class="prose max-w-none prose-headings:font-bold prose-headings:text-black prose-p:text-black prose-li:text-black prose-table:border-collapse prose-td:border prose-td:border-black prose-td:p-2 prose-th:border prose-th:border-black prose-th:bg-slate-50 prose-th:text-black prose-th:p-2 prose-strong:text-black" [innerHTML]="safeContent()"></div>
          </div>
        } @else {
           <div class="flex flex-col items-center justify-center text-slate-400 mt-20">
             <p class="text-lg font-medium text-slate-600">ไม่พบข้อมูลใบงาน</p>
             <p class="text-sm">กลับไปที่แผนการสอน แล้วกดปุ่ม "สร้างใบงาน"</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ActivityGeneratorComponent {
  content = input<string | null>(null);
  isLoading = input<boolean>(false);
  backToPlan = output<void>();

  private sanitizer: DomSanitizer = inject(DomSanitizer);

  safeContent = computed(() => {
    const raw = this.content();
    if (!raw) return '';
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  });
  
  downloadWord() {
    const content = this.content();
    if (!content) return;

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Worksheet</title>
        <style>
          @page { size: 21cm 29.7cm; margin: 2cm; }
          body { 
            font-family: 'TH Sarabun New', 'Sarabun', sans-serif; 
            font-size: 16pt; 
            color: #000000; 
            line-height: 1.5;
          }
          h1, h2, h3 { font-weight: bold; }
          h1 { font-size: 20pt; }
          h2 { font-size: 18pt; }
          h3 { font-size: 16pt; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #000; }
          th, td { border: 1px solid #000; padding: 5px; vertical-align: top; text-align: left; }
          .break-before-page { page-break-before: always; }
          .break-inside-avoid { page-break-inside: avoid; }
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
    link.download = 'Worksheet.doc'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

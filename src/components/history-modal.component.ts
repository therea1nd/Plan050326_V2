import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, HistoryItem } from '../services/gemini.service';

@Component({
  selector: 'app-history-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" (click)="close.emit()">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-blue-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ประวัติการสร้าง ({{ historyItems.length }})
          </h3>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          @if (historyItems.length === 0) {
            <div class="flex flex-col items-center justify-center py-10 text-slate-400">
              <p>ยังไม่มีประวัติการสร้าง</p>
            </div>
          }

          @for (item of historyItems; track item.id) {
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group relative cursor-pointer" (click)="select.emit(item)">
              <!-- Header: Subject Badge & Time -->
              <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-2">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                          </svg>
                          {{ item.data.subject }}
                      </span>
                  </div>
                  <span class="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                      {{ item.timestamp | date:'d MMM HH:mm' }}
                  </span>
              </div>

              <!-- Main Content -->
              <h4 class="font-bold text-slate-800 text-base mb-2 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                  {{ item.data.topic }}
              </h4>

              <!-- Details Grid -->
              <div class="grid grid-cols-2 gap-y-1 gap-x-4 text-xs text-slate-500">
                  <div class="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 text-slate-400">
                          <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clip-rule="evenodd" />
                      </svg>
                      <span class="truncate">{{ item.data.grade }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5 text-slate-400">
                          <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                      </svg>
                      <span class="truncate">{{ item.data.teacher || 'ไม่ระบุครู' }}</span>
                  </div>
              </div>

              <!-- Delete Button -->
              <button (click)="deleteItem(item.id, $event)" class="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all z-10" title="ลบรายการ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          }
        </div>

        <!-- Footer -->
        <div class="p-4 bg-white border-t border-slate-100 text-center text-xs text-slate-400">
          แสดงรายการล่าสุด 3 รายการ
        </div>
      </div>
    </div>
  `
})
export class HistoryModalComponent {
  historyItems: HistoryItem[] = [];
  close = output<void>();
  select = output<HistoryItem>();
  
  private geminiService = inject(GeminiService);

  constructor() {
    this.refreshList();
  }

  refreshList() {
    this.historyItems = this.geminiService.getHistory();
  }

  deleteItem(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) {
      this.historyItems = this.geminiService.deleteHistoryItem(id);
    }
  }
}

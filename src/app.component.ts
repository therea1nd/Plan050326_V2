import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LessonFormComponent } from './components/lesson-form.component';
import { LessonPreviewComponent } from './components/lesson-preview.component';
import { HistoryModalComponent } from './components/history-modal.component';
import { SlidesGeneratorComponent } from './components/slides-generator.component';
import { ActivityGeneratorComponent } from './components/activity-generator.component';
import { GeminiService, LessonData, HistoryItem, SlideContent } from './services/gemini.service';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LessonFormComponent, LessonPreviewComponent, HistoryModalComponent, SlidesGeneratorComponent, ActivityGeneratorComponent, LoginComponent, RegisterComponent],
  template: `
    @if (authService.currentUser()) {
      <!-- Main Layout Container -->
      <!-- Mobile: Flex Column (Vertical Stack), Auto Height -->
      <!-- Desktop: Flex Row (Horizontal Split), Screen Height, Hidden Overflow -->
      <div class="flex flex-col md:flex-row w-full bg-slate-50 font-sans md:h-screen md:overflow-hidden">
        
        <!-- Left: Form Section -->
        <div class="w-full md:w-[400px] lg:w-[450px] shrink-0 bg-white md:h-full md:overflow-y-auto z-20 border-r border-slate-200">
          <app-lesson-form 
            [isLoading]="isLoading()"
            [initialData]="formInitialData()"
            (generate)="onGenerate($event)"
            (openHistory)="showHistory.set(true)">
          </app-lesson-form>
        </div>

        <!-- Right: Content Section -->
        <div id="preview-section" class="w-full grow bg-white md:h-full md:overflow-y-auto">
          @switch (activeView()) {
            @case ('plan') {
              <app-lesson-preview 
                [content]="generatedLesson()" 
                [isLoading]="isLoading()"
                (generateSlides)="onGenerateSlides()"
                (generateActivities)="onGenerateActivities()"
                (edit)="onEditLesson()">
              </app-lesson-preview>
            }
            @case ('slides') {
              <app-slides-generator
                [slides]="generatedSlides()"
                [isLoading]="isSlidesLoading()"
                (backToPlan)="activeView.set('plan')">
              </app-slides-generator>
            }
            @case ('activities') {
              <app-activity-generator
                [content]="generatedActivities()"
                [isLoading]="isActivitiesLoading()"
                (backToPlan)="activeView.set('plan')">
              </app-activity-generator>
            }
          }
        </div>
      </div>

      <!-- History Modal -->
      @if (showHistory()) {
        <app-history-modal 
          (close)="showHistory.set(false)"
          (select)="restoreHistory($event)">
        </app-history-modal>
      }

      <!-- User display -->
      <div class="fixed bottom-4 right-4 z-30">
        <div class="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-slate-700 text-sm font-medium px-4 py-2 rounded-full shadow-md border border-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-slate-500">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clip-rule="evenodd" />
            </svg>
            <span>{{ authService.currentUser()?.username }}</span>
        </div>
      </div>

    } @else {
      <main class="w-full h-screen flex items-center justify-center bg-slate-50 p-4">
        @if (authView() === 'login') {
          <app-login (showRegister)="authView.set('register')"></app-login>
        } @else {
          <app-register (showLogin)="authView.set('login')"></app-register>
        }
      </main>
    }
  `
})
export class AppComponent {
  private geminiService = inject(GeminiService);
  authService = inject(AuthService);

  authView = signal<'login' | 'register'>('login');

  generatedLesson = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  showHistory = signal<boolean>(false);
  formInitialData = signal<LessonData | null>(null);
  
  // State for view management
  activeView = signal<'plan' | 'slides' | 'activities'>('plan');
  
  generatedSlides = signal<SlideContent[] | null>(null);
  isSlidesLoading = signal<boolean>(false);
  
  generatedActivities = signal<string | null>(null);
  isActivitiesLoading = signal<boolean>(false);

  currentLessonData = signal<LessonData | null>(null);

  async onGenerate(data: LessonData) {
    this.isLoading.set(true);
    this.currentLessonData.set(data);
    this.activeView.set('plan');
    this.generatedLesson.set(null);
    this.generatedSlides.set(null);
    this.generatedActivities.set(null);

    this.scrollToPreviewMobile();
    
    try {
      const result = await this.geminiService.generateLessonPlan(data);
      this.generatedLesson.set(result);
      this.geminiService.saveToHistory(data, result);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้ง');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onGenerateSlides() {
    this.scrollToPreviewMobile();
    // If slides exist, just switch view
    if (this.generatedSlides()) {
      this.activeView.set('slides');
      return;
    }

    const lessonData = this.currentLessonData();
    if (!lessonData) {
      alert('กรุณาสร้างแผนการสอนก่อน');
      return;
    }

    this.isSlidesLoading.set(true);
    this.activeView.set('slides');

    try {
      const slides = await this.geminiService.generateSlides(lessonData);
      this.generatedSlides.set(slides);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสร้างสไลด์ กรุณาลองใหม่อีกครั้ง');
      this.activeView.set('plan'); // Go back on error
    } finally {
      this.isSlidesLoading.set(false);
    }
  }

  async onGenerateActivities() {
    this.scrollToPreviewMobile();
    // If activities exist, just switch view
    if (this.generatedActivities()) {
      this.activeView.set('activities');
      return;
    }

    const lessonData = this.currentLessonData();
    if (!lessonData) {
      alert('กรุณาสร้างแผนการสอนก่อน');
      return;
    }

    this.isActivitiesLoading.set(true);
    this.activeView.set('activities');

    try {
      const activities = await this.geminiService.generateActivities(lessonData);
      this.generatedActivities.set(activities);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการสร้างใบงาน กรุณาลองใหม่อีกครั้ง');
      this.activeView.set('plan'); // Go back on error
    } finally {
      this.isActivitiesLoading.set(false);
    }
  }

  onEditLesson() {
    const data = this.currentLessonData();
    if (data) {
      this.formInitialData.set(data);
      // Scroll to form on mobile
      if (window.innerWidth < 768) {
        document.querySelector('app-lesson-form')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  restoreHistory(item: HistoryItem) {
    this.showHistory.set(false);
    this.activeView.set('plan');
    this.generatedSlides.set(null);
    this.generatedActivities.set(null);
    
    this.generatedLesson.set(item.content);
    this.formInitialData.set(item.data);
    this.currentLessonData.set(item.data);
    
    this.scrollToPreviewMobile();
  }

  private scrollToPreviewMobile() {
    // Only scroll on mobile screens
    if (window.innerWidth < 768) {
      setTimeout(() => {
        const el = document.getElementById('preview-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }
}

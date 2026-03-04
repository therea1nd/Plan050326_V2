import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { AuthService } from './auth.service';

export interface LessonData {
  subject: string;
  grade: string;
  teachingMethod: string;
  teacher: string;
  topic: string;
  duration: string;
  context: string;
  skills: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  data: LessonData;
  content: string; // The generated HTML
}

export interface SlideContent {
  slideNumber: number;
  title: string;
  content: string; // Bullet points as a single string with newlines
  designNotes: string; // e.g., "Use a large image of a food web."
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private readonly HISTORY_DB_KEY = 'kruplan_history_db_v2';
  private authService = inject(AuthService);

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  // --- AI Generation ---

  async generateLessonPlan(data: LessonData): Promise<string> {
    const prompt = `
      คุณคือผู้เชี่ยวชาญด้านหลักสูตรและการสอน (Expert Curriculum Developer) ของกระทรวงศึกษาธิการ
      หน้าที่ของคุณคือเขียน "แผนการจัดการเรียนรู้" (Lesson Plan) ที่ถูกต้องตามหลักวิชาการและหลักสูตรแกนกลางฯ
      
      ข้อมูลตั้งต้น:
      - วิชา: ${data.subject}
      - ระดับชั้น: ${data.grade}
      - รูปแบบการสอน: ${data.teachingMethod}
      - หัวข้อ/เรื่อง: ${data.topic}
      - ผู้สอน: ${data.teacher}
      - เวลา: ${data.duration} นาที
      - บริบท: ${data.context}
      - ทักษะที่เน้น: ${data.skills}

      คำสั่ง: ให้สร้างแผนการสอนในรูปแบบ HTML เท่านั้น โดยเน้นการจัดหน้าสำหรับพิมพ์ลงกระดาษ A4 ให้สวยงามตามมาตรฐานราชการไทย

      **ข้อห้ามสำคัญ (Critical Rules):**
      1. **ห้ามใช้ Markdown Syntax** เช่น **ตัวหนา** หรือ *ตัวเอียง* ในเนื้อหาโดยเด็ดขาด
      2. หากต้องการทำตัวหนา ให้ใช้ HTML Tag <strong>...</strong> เท่านั้น
      3. ห้ามส่ง Markdown Code Block (\`\`\`)
      
      **โครงสร้าง HTML, Class และขนาดตัวอักษร (สำคัญมาก):**
      1. ใช้หน่วย **pt** เท่านั้นเพื่อให้ตรงกับเอกสาร Word (เนื้อหา 16pt, หัวข้อ 18pt)
      2. ให้ห่อหุ้ม (Wrap) แต่ละหัวข้อหลักด้วย <section class="mb-6 break-inside-avoid">
      3. ตารางทุกตารางต้องมี class="w-full border-collapse border border-black mb-4 break-inside-avoid text-black text-[16pt]"
      4. หัวข้อหลักใช้ <h3 class="text-[18pt] font-bold border-b border-black pb-2 mb-3 mt-4 text-black leading-none">
      5. **การใช้รายการ (List) ให้ใช้ตัวเลขเท่านั้น (Ordered List)**:
         - ใช้ <ol class="list-decimal pl-5 space-y-1 text-black text-[16pt] leading-normal">
         - ห้ามใช้ Bullet Point (<ul>) โดยเด็ดขาด ให้ใช้ตัวเลข (1., 2., 3.) แทนทั้งหมด
      6. เนื้อหาและข้อความทั่วไปทั้งหมดต้องเป็น class="text-black text-[16pt] leading-normal"

      **เนื้อหาในแผนการสอน:**
      
      1. **ส่วนหัว (Header)**: 
         สร้างส่วนหัวแบบกะทัดรัด (Compact Header) ความสูงรวมห้ามเกิน 4 บรรทัด:
         <div class="text-center mb-6 pb-4 border-b-2 border-black break-inside-avoid">
           <h1 class="text-[20pt] font-bold text-black leading-none">แผนการจัดการเรียนรู้ รายวิชา${data.subject} ระดับชั้น${data.grade}</h1>
           <h2 class="text-[18pt] font-bold text-black mt-1 leading-none">เรื่อง ${data.topic} (เวลา ${data.duration} นาที)</h2>
           <p class="text-[16pt] text-black mt-2 leading-none">
             <span class="font-bold">รูปแบบการสอน: ${data.teachingMethod}</span>
             <span class="mx-2">|</span>
             <span>ครูผู้สอน: ${data.teacher}</span>
           </p>
         </div>
      
      2. **มาตรฐานการเรียนรู้และตัวชี้วัด**: 
         - ค้นหามาตรฐานการเรียนรู้และตัวชี้วัดที่เกี่ยวข้องกับหัวข้อและระดับชั้นให้ถูกต้องและครบถ้วนจากฐานข้อมูลหลักสูตรแกนกลางฯ
         - **สำคัญ:** ให้แสดงผลแยกเป็น 2 ส่วนที่ชัดเจนและอยู่ในระดับเดียวกัน โดยใช้โครงสร้าง HTML ดังนี้:
         
           <p class="text-black text-[16pt] leading-normal mb-2">
             <strong>มาตรฐานการเรียนรู้:</strong> [ตามด้วยรหัสและคำอธิบายเต็มของมาตรฐาน]
           </p>
           
           <div>
             <strong class="text-black text-[16pt]">ตัวชี้วัด:</strong>
             <ol class="list-decimal pl-8 mt-1 text-black text-[16pt] leading-normal">
               <li>[รหัสตัวชี้วัดข้อที่ 1 และคำอธิบายเต็ม]</li>
               <!-- หากมีตัวชี้วัดอื่นที่เกี่ยวข้อง ให้เพิ่มเป็น <li> ต่อไป -->
             </ol>
           </div>

      3. **สาระสำคัญ (Concept)**: เขียนความคิดรวบยอดสั้นๆ

      4. **จุดประสงค์การเรียนรู้ (K-P-A Model)**: 
         - แยกเป็น 3 ข้อ: (K) ความรู้, (P) ทักษะ, (A) เจตคติ
         - ใช้คำกริยาเชิงพฤติกรรม
         - ใช้ <ol class="list-decimal pl-5 ...">

      5. **สมรรถนะสำคัญของผู้เรียน**: ระบุสมรรถนะที่สอดคล้อง (ใช้ <ol>)

      6. **กิจกรรมการเรียนรู้ (Learning Activities)**: 
         - เขียนขั้นตอนกิจกรรมตาม "รูปแบบการสอน" ที่ระบุ (${data.teachingMethod})
         - เขียนเป็นข้อๆ เรียงลำดับตัวเลข ให้อ่านง่าย โดยใช้ <ol class="list-decimal pl-5 ..."><li class="mb-2 text-black text-[16pt]">...</li></ol>
         - ห้ามใช้ **...** ในการเน้นหัวข้อย่อย ให้ใช้ <strong>...</strong> หรือ <u>...</u> แทน

      7. **สื่อ/แหล่งการเรียนรู้**: ระบุสื่อ (ใช้ <ol>)

      8. **การวัดและประเมินผล**: 
         สร้างตาราง 3 คอลัมน์ (สิ่งที่วัด, วิธีวัด, เครื่องมือ) โดยใช้เส้นตารางสีดำ
         **สำคัญ: ต้องแยกแถว (Table Row) ตามหัวข้อ K-P-A ดังนี้:**
         - **แถวที่ 1 (K):** คอลัมน์แรกต้องขึ้นต้นด้วย "<strong>1. ด้านความรู้ (K)</strong>" ตามด้วยรายการสิ่งที่วัด
         - **แถวที่ 2 (P):** คอลัมน์แรกต้องขึ้นต้นด้วย "<strong>2. ด้านทักษะ/กระบวนการ (P)</strong>" ตามด้วยรายการสิ่งที่วัด
         - **แถวที่ 3 (A):** คอลัมน์แรกต้องขึ้นต้นด้วย "<strong>3. ด้านคุณลักษณะ (A)</strong>" ตามด้วยรายการสิ่งที่วัด
         (ห้ามใช้ Bullet Point ให้ใช้ <ol class="list-decimal pl-5 ..."><li>...</li></ol> สำหรับรายการในแต่ละช่อง เพื่อให้แสดงเป็นเลข 1., 2., 3.)

      9. **บันทึกหลังการสอน**: 
         <section class="break-inside-avoid border border-black rounded p-4 mt-6 bg-white">
           <h4 class="font-bold mb-2 text-black text-[18pt]">บันทึกหลังการสอน</h4>
           <div class="h-24 border-b border-black border-dashed mb-2"></div>
           <div class="h-24 border-b border-black border-dashed"></div>
           <p class="text-[16pt] text-right mt-2 text-black">ลงชื่อครูผู้สอน...........................................</p>
         </section>

      รูปแบบการแสดงผล:
      - ส่งคืนเฉพาะ HTML ภายใน div wrapper (ไม่ต้องมี <html> หรือ <body>)
      - ใช้ Tailwind CSS แบบ Arbitrary values (เช่น text-[16pt]) เพื่อบังคับขนาดฟอนต์
      - ใช้สีดำ (Black) สำหรับตัวอักษรและเส้นขอบทั้งหมด
      - Font ตระกูล TH Sarabun New หรือ Sarabun
      - **เน้นย้ำ**: เปลี่ยนจากการใช้ Bullet Point เป็นตัวเลข (1., 2., 3.) หรือลำดับข้อ (1.1, 1.2) ทั้งหมด

      ขอให้เขียนด้วยภาษาทางการ ถูกต้องตามหลักไวยากรณ์ไทย และจัดรูปแบบให้พิมพ์ออกมาสวยงามเหมือนเอกสารจริง
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      let cleanText = response.text || '';
      // Clean markdown code blocks
      cleanText = cleanText.replace(/```html/g, '').replace(/```/g, '');
      // Force remove any remaining double asterisks
      cleanText = cleanText.replace(/\*\*/g, '');
      
      return cleanText;
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      throw error;
    }
  }

  async generateSlides(lessonData: LessonData): Promise<SlideContent[]> {
    const prompt = `
      คุณคือผู้เชี่ยวชาญด้านการออกแบบสื่อการสอน (Instructional Designer)
      หน้าที่ของคุณคือสร้างเนื้อหาสำหรับสไลด์นำเสนอ (Presentation Slides) จากข้อมูลแผนการสอนที่กำหนดให้

      ข้อมูลแผนการสอน:
      - วิชา: ${lessonData.subject}
      - ระดับชั้น: ${lessonData.grade}
      - หัวข้อ/เรื่อง: ${lessonData.topic}
      
      คำสั่ง:
      ให้สร้างเนื้อหาสำหรับชุดสไลด์ประมาณ 8-12 สไลด์ ซึ่งครอบคลุมเนื้อหาสำคัญของแผนการสอนนี้ โดยให้ส่งผลลัพธ์เป็น JSON array เท่านั้น

      ข้อกำหนดสำหรับแต่ละสไลด์ใน JSON array:
      1. slideNumber: (number) ลำดับของสไลด์
      2. title: (string) หัวข้อของสไลด์ (ต้องเป็นภาษาไทย)
      3. content: (string) เนื้อหาหลักในสไลด์ ควรเป็น bullet points (ใช้ '-' นำหน้าแต่ละข้อ) และขึ้นบรรทัดใหม่สำหรับแต่ละข้อ
      4. designNotes: (string) คำแนะนำสั้นๆ สำหรับการออกแบบสไลด์หน้านี้ เช่น "ใส่รูปภาพประกอบ", "ใช้แผนภูมิ", "วิดีโอสาธิต"

      ลำดับของสไลด์:
      - สไลด์ที่ 1: ต้องเป็นหน้าปก (Title Slide)
      - สไลด์กลางๆ: ควรมีเนื้อหาหลัก, กิจกรรม, หรือคำถามกระตุ้นความคิด
      - สไลด์สุดท้าย: ต้องเป็นหน้าสรุปเนื้อหา หรือ Q&A

      **ห้าม**ใส่ผลลัพธ์ใน Markdown code block (\`\`\`) โดยเด็ดขาด
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                slideNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                designNotes: { type: Type.STRING },
              },
              required: ["slideNumber", "title", "content", "designNotes"],
            },
          },
        },
      });

      const jsonStr = response.text.trim();
      const slides = JSON.parse(jsonStr);
      return slides as SlideContent[];

    } catch (error) {
      console.error('Error generating slides:', error);
      throw error;
    }
  }

  async generateActivities(data: LessonData): Promise<string> {
    const prompt = `
      คุณคือผู้เชี่ยวชาญด้านการวัดผลและประเมินผล
      หน้าที่ของคุณคือสร้าง "ใบงานและกิจกรรม" สำหรับนักเรียนในรูปแบบ HTML ที่พร้อมพิมพ์ลงกระดาษ A4

      ข้อมูลสำหรับสร้างใบงาน:
      - วิชา: ${data.subject}
      - ระดับชั้น: ${data.grade}
      - หัวข้อ/เรื่อง: ${data.topic}

      คำสั่ง:
      1.  สร้างชุดใบงาน/กิจกรรมที่หลากหลายจำนวน 2-3 กิจกรรม เพื่อประเมินความเข้าใจของนักเรียนในหัวข้อเรื่อง "${data.topic}"
      2.  ตัวอย่างกิจกรรม: แบบฝึกหัดเติมคำ, จับคู่, คำถามปรนัย, คำถามอัตนัยสั้นๆ, หรือกิจกรรมวาดภาพ/แผนผัง
      3.  แต่ละกิจกรรมต้องมี "ชื่อกิจกรรม" และ "คำชี้แจง" ที่ชัดเจน
      4.  สร้าง "เฉลยคำตอบ" ไว้ในส่วนท้ายสุดของเอกสาร แยกออกจากส่วนใบงานอย่างชัดเจน
      5.  จัดรูปแบบทั้งหมดด้วย HTML และใช้ class จาก Tailwind CSS ตามกฎข้างล่างนี้

      **โครงสร้างและกฎการใช้ HTML/CSS (สำคัญมาก):**
      - **ห้าม**ใส่ \`\`\`html หรือ \`\`\`
      - ใช้ font-family 'TH Sarabun New' หรือ 'Sarabun' และใช้สีดำเป็นหลัก
      - ขนาดตัวอักษรเนื้อหาทั่วไป: class="text-[16pt]"
      - ขนาดตัวอักษรหัวข้อ: class="text-[18pt] font-bold"
      - **Header ของใบงาน:**
        <div class="text-center mb-6 pb-4 border-b-2 border-black break-inside-avoid">
          <h1 class="text-[20pt] font-bold text-black leading-tight">ใบงานวิชา ${data.subject}</h1>
          <h2 class="text-[18pt] text-black">เรื่อง ${data.topic}</h2>
          <div class="flex justify-between items-center mt-4 text-[16pt]">
            <p>ชื่อ-สกุล.........................................................................</p>
            <p>ชั้น......................... เลขที่...................</p>
          </div>
        </div>
      - **แต่ละกิจกรรม:** ห่อหุ้มด้วย <section class="mb-8 break-inside-avoid">...</section>
      - **ชื่อกิจกรรม:** <h3 class="text-[18pt] font-bold text-black mb-2">กิจกรรมที่ [เลขที่]: [ชื่อกิจกรรม]</h3>
      - **คำชี้แจง:** <p class="text-[16pt] text-black mb-4"><strong>คำชี้แจง:</strong> [คำอธิบาย]</p>
      - **รายการคำถาม:** ใช้ <ol class="list-decimal pl-8 space-y-4 text-[16pt]"><li>...</li></ol>
      - **พื้นที่สำหรับตอบ:** สำหรับคำถามอัตนัย ให้เว้นที่ว่างโดยใช้ <div class="h-20 border-b border-dotted border-black"></div>
      - **เฉลย:**
        <section class="mt-12 pt-6 border-t-4 border-double border-black break-before-page">
          <h2 class="text-center text-[20pt] font-bold mb-4">เฉลยใบงาน</h2>
          ...
        </section>

      ขอให้สร้างเนื้อหาที่เหมาะสมกับระดับชั้น ${data.grade} และมีความถูกต้องตามหลักวิชาการ
    `;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let cleanText = response.text || '';
      cleanText = cleanText.replace(/```html/g, '').replace(/```/g, '');
      cleanText = cleanText.replace(/\*\*/g, '');
      
      return cleanText;
    } catch (error) {
      console.error('Error generating activities:', error);
      throw error;
    }
  }

  // --- History Management ---

  getHistory(): HistoryItem[] {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];

    try {
      const allHistoriesJson = localStorage.getItem(this.HISTORY_DB_KEY);
      const allHistories: Record<string, HistoryItem[]> = allHistoriesJson ? JSON.parse(allHistoriesJson) : {};
      const userHistory = allHistories[currentUser.email] || [];
      
      // Filter out items older than 7 days.
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentHistory = userHistory.filter(item => item.timestamp >= sevenDaysAgo);
      
      // If items were removed by the filter, update localStorage to persist the cleanup.
      if (recentHistory.length < userHistory.length) {
        allHistories[currentUser.email] = recentHistory;
        localStorage.setItem(this.HISTORY_DB_KEY, JSON.stringify(allHistories));
      }

      return recentHistory;
    } catch (e) {
      return [];
    }
  }

  saveToHistory(data: LessonData, content: string): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    const allHistoriesJson = localStorage.getItem(this.HISTORY_DB_KEY);
    const allHistories: Record<string, HistoryItem[]> = allHistoriesJson ? JSON.parse(allHistoriesJson) : {};
    
    const userHistory = allHistories[currentUser.email] || [];

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      data,
      content
    };
    
    // Keep only last 3 items to avoid localStorage limits
    const updatedHistory = [newItem, ...userHistory].slice(0, 3);
    allHistories[currentUser.email] = updatedHistory;

    localStorage.setItem(this.HISTORY_DB_KEY, JSON.stringify(allHistories));
  }

  deleteHistoryItem(id: string): HistoryItem[] {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];

    const allHistoriesJson = localStorage.getItem(this.HISTORY_DB_KEY);
    const allHistories: Record<string, HistoryItem[]> = allHistoriesJson ? JSON.parse(allHistoriesJson) : {};

    let userHistory = allHistories[currentUser.email] || [];
    userHistory = userHistory.filter(item => item.id !== id);
    allHistories[currentUser.email] = userHistory;

    localStorage.setItem(this.HISTORY_DB_KEY, JSON.stringify(allHistories));
    return userHistory;
  }
}
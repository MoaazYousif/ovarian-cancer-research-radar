import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client on server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Ovarian Cancer Research Radar API',
    time: new Date().toISOString(),
  });
});

// Structured AI Summarization Endpoint
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const { paper, researcherProfile } = req.body;
    if (!paper || !paper.title) {
      return res.status(400).json({ error: 'Paper payload is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const prompt = `You are a world-class bioinformatics and ovarian cancer research intelligence analyst.
Analyze the following ovarian cancer scientific paper and generate a structured research intelligence brief.

PAPER DETAILS:
Title: ${paper.title}
Abstract: ${paper.abstract}
Journal: ${paper.journal}
Publication Date: ${paper.publicationDate}
Classified Subtype: ${paper.ovarianSubtype}
Extracted Entities: ${JSON.stringify(paper.entities || {})}
Evidence Source: ${paper.openAccess ? 'Full open-access article available' : 'Abstract-based record'}

RESEARCHER FOCUS PROFILE:
Primary Subtype of Interest: ${researcherProfile?.primarySubtype || 'HGSOC'}
Core Interests: ${(researcherProfile?.interests || []).slice(0, 15).join(', ')}
Methods: ${(researcherProfile?.methods || []).slice(0, 8).join(', ')}

CRITICAL ANTI-HALLUCINATION INSTRUCTIONS:
1. Distinguish between explicitly reported facts in the abstract/paper and inferences.
2. If sample sizes, p-values, or datasets are not mentioned, explicitly state "Not reported in available abstract".
3. Do not invent target genes or fake clinical trial arms.
4. If full text is not provided, label findings as based on available abstract.

Generate a comprehensive structured JSON output matching the required schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert ovarian cancer computational oncologist and precision medicine specialist. Provide rigorous, evidence-grounded scientific synthesis without hallucinations.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tldr: {
              type: Type.STRING,
              description: '2-3 sentence executive synthesis for busy researchers.',
            },
            researchQuestion: {
              type: Type.STRING,
              description: 'Precise biological or clinical question investigated.',
            },
            studyDesign: {
              type: Type.STRING,
              description: 'Cohort, sample size, model systems, or computational pipeline design.',
            },
            methodsSummary: {
              type: Type.STRING,
              description: 'Key experimental or bioinformatic methods utilized.',
            },
            mainFindings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 6 bulleted core empirical discoveries.',
            },
            clinicalSignificance: {
              type: Type.STRING,
              description: 'Actionable translational impact on patient stratification or therapy.',
            },
            biologicalSignificance: {
              type: Type.STRING,
              description: 'Cellular, genomic, or pathway mechanisms revealed.',
            },
            limitations: {
              type: Type.STRING,
              description: 'Key limitations and explicit note distinguishing abstract vs full-text analysis.',
            },
            ovarianSubtypeRationale: {
              type: Type.STRING,
              description: 'Detailed analysis of which ovarian subtype(s) were studied.',
            },
            hgsocRelevance: {
              type: Type.STRING,
              description: 'Specific applicability or distinction regarding High-Grade Serous Ovarian Cancer.',
            },
            personalResearchRelevance: {
              type: Type.STRING,
              description: 'Why this paper is important to the researcher based on their profile.',
            },
            emergingEntities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Newly discovered genes, pathways, drugs, biomarkers, or technologies.',
            },
            researchImplications: {
              type: Type.STRING,
              description: 'Next research directions or experiments to pursue.',
            },
          },
          required: [
            'tldr',
            'researchQuestion',
            'studyDesign',
            'methodsSummary',
            'mainFindings',
            'clinicalSignificance',
            'biologicalSignificance',
            'limitations',
            'ovarianSubtypeRationale',
            'hgsocRelevance',
            'personalResearchRelevance',
            'emergingEntities',
            'researchImplications',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/summarize:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate AI summary' });
  }
});

// Social Media Post Generator (Facebook & LinkedIn Arabic Templates)
app.post('/api/generate-post', async (req: Request, res: Response) => {
  try {
    const { paper } = req.body;
    if (!paper || !paper.title) {
      return res.status(400).json({ error: 'Paper payload is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const year = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : '2026';
    const authorsStr = (paper.authors || []).map((a: any) => a.name).slice(0, 3).join('، ') + ((paper.authors?.length > 3) ? ' وآخرون' : '');
    
    // Clean and validate DOI link accurately
    const rawDoi = paper.doi ? String(paper.doi).replace(/^doi:\s*/i, '').trim() : '';
    const pmid = paper.pmid || (paper.id ? String(paper.id).replace(/^pmid_/, '') : '');
    const doiUrl = rawDoi 
      ? (rawDoi.startsWith('http') ? rawDoi : `https://doi.org/${rawDoi}`) 
      : (pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : 'https://pubmed.ncbi.nlm.nih.gov/');

    const prompt = `أنت بروفيسور وباحث أول في علم الأورام الجزيئي والـ Bioinformatics، وكاتب محتوى علمي وأكاديمي احترافي فائق التميز (Senior Oncology Science Communicator).
المطلوب منك تحويل الورقة العلمية الآتية إلى منشورين باللغة العربية الفصحى الرصينة، الجذابة، والعميقة علمياً:
1. منشور لـ Facebook وفق القالب الدقيق.
2. منشور لـ LinkedIn وفق القالب المهني الاحترافي.

بيانات الورقة العلمية:
• العنوان: ${paper.title}
• الملخص الأصلي (Abstract): ${paper.abstract}
• المجلة العلمية: ${paper.journal}
• سنة النشر: ${year}
• الباحثون: ${authorsStr}
• النمط النسيجي: ${paper.ovarianSubtype}
• الجينات والأهداف: ${(paper.entities?.genes || []).join('، ') || 'جينات المقاومة والتنظيم الخلوي'}
• الأدوية والمسارات الحيوية: ${(paper.entities?.drugs || []).concat(paper.entities?.pathways || []).join('، ') || 'العلاجات الموجهة'}
• الرابط الرسمي/DOI: ${doiUrl}

=======================================================
قالب فيسبوك المطلوب حرفياً (أسلوب ذكي، مبسط ببراعة، مشوق، ومتباعد الأسطر بوضوح شديد):
=======================================================
🧠 [اكتب جملة صادمة أو سؤالاً استثنائياً يثير الفضول العلمي حول موضوع الورقة]

عمرك فكرت إن [المشكلة أو الفكرة الشائعة الخاطئة في علاج/تشخيص سرطان المبيض] ممكن تكون مش صحيحة بالشكل اللي إحنا متخيلينه؟

باحثون حاولوا يجاوبوا على السؤال ده من خلال دراسة حديثة نُشرت في مجلة ${paper.journal} بعنوان:
📄 "${paper.title}"

والنتيجة كانت مثيرة للاهتمام…

━━━━━━━━━━━━━━━━━━━━━
1️⃣ الباحثون كانوا بيدرسوا إيه؟ (سؤال البحث)
━━━━━━━━━━━━━━━━━━━━━
ببساطة، الدراسة حاولت تعرف:
[صياغة عربية واضحة ومبسطة ودقيقة جداً للسؤال البحثي في سطرين مستقلين].

━━━━━━━━━━━━━━━━━━━━━
2️⃣ عملوا إيه؟ (تصميم الدراسة والمنهجية)
━━━━━━━━━━━━━━━━━━━━━
استخدم الباحثون:
[شرح نوع وتصميم الدراسة والعينات].

المنهجية التحليلية:
[شرح التقنيات التحليلية المستخدمة].

━━━━━━━━━━━━━━━━━━━━━
3️⃣ إيه أهم نتيجة؟
━━━━━━━━━━━━━━━━━━━━━
النتائج أظهرت أن:
• [النتيجة الأولى مدعمة بالأرقام أو النسب إن وجدت]
• [النتيجة الثانية]

لكن هنا النقطة الأهم… النتيجة دي معناها إيه عملياً؟ 👇
يعني لو أنت [طبيب أورام، أو باحث بيولوجي، أو مهتم بالطب الدقيق]، فالمعلومة دي هتساعدك في:
👉 [التطبيق العملي أو فهم مسار علاجي جديد].

━━━━━━━━━━━━━━━━━━━━━
⚠️ حدود الدراسة ونقاط الحذر:
━━━━━━━━━━━━━━━━━━━━━
[اذكر أهم Limitations وتجنب التعميم الزائد بدقة علمية].

━━━━━━━━━━━━━━━━━━━━━
🎯 الخلاصة في جملة واحدة:
━━━━━━━━━━━━━━━━━━━━━
[أقوى Takeaway علمي مكثف من الورقة]

📌 الورقة: ${paper.title}
👨‍🔬 الباحثون: ${authorsStr}
📅 السنة: ${year}
🔗 المصدر: ${doiUrl}

لو حابب، اكتب "Paper" في التعليقات وأنا أختار لك ورقة تانية وأبسطها بنفس الطريقة.


=======================================================
قالب لينكد إن المطلوب حرفياً (أسلوب تنفيذي استراتيجي رصين موجه لخبراء الأورام ومتباعد الأسطر بوضوح):
=======================================================
[Insight استراتيجي قوي جداً وعميق في أول سطر يبرز نقلة نوعية في علم الأورام]

معظم الناس بتعتقد أن [المعتقد التقليدي أو الممارسة السائدة].

لكن دراسة حديثة نُشرت في ${paper.journal} وجدت أن [النتيجة العلمية الدقيقة والتحول الجديد].

📄 Paper: ${paper.title}
👨‍🔬 Authors: ${authorsStr}
📅 Year: ${year}

━━━━━━━━━━━━━━━━━━━━━
❓ السؤال الذي حاول الباحثون الإجابة عنه:
━━━━━━━━━━━━━━━━━━━━━
> [صياغة البحث باللغة العربية بأسلوب أكاديمي دقيق]

━━━━━━━━━━━━━━━━━━━━━
🔬 تصميم الدراسة ومنهجية العمل (Study Design & Methodology):
━━━━━━━━━━━━━━━━━━━━━
• تصميم الدراسة والعينة:
[تفاصيل نوع العينة وحجمها ونماذج التجربة].

• المنهجية والأدوات التحليلية:
[التقنيات الحيوية والمعلوماتية المستخدمة].

━━━━━━━━━━━━━━━━━━━━━
💡 أهم 3 نتائج:
━━━━━━━━━━━━━━━━━━━━━
1. [Finding #1 موثق ومحدد]
   → ماذا تعني؟ [تفسير بيولوجي وسريري مباشر]

2. [Finding #2 موثق ومحدد]
   → ماذا تعني؟ [تفسير بيولوجي وسريري مباشر]

3. [Finding #3 موثق ومحدد]
   → ماذا تعني؟ [تفسير بيولوجي وسريري مباشر]

━━━━━━━━━━━━━━━━━━━━━
🚀 الأثر التطبيقي والـ Actionable Insight:
━━━━━━━━━━━━━━━━━━━━━
👉 [Insight عملي واستراتيجي قابل للتنفيذ في البحث أو الممارسة السريرية]

وده يخلينا نعيد التفكير في [تصميم البروتوكولات، اللوحات الجينية، أو استراتيجيات الجمع بين الأدوية].

مثال عملي:
لو كنت تعمل في [تطوير الأدوية، التحليل الجينومي، أو التجارب السريرية]، فبدلًا من [النهج التقليدي]، يمكنك تجربة [النهج المستند إلى النتائج الجديدة].

━━━━━━━━━━━━━━━━━━━━━
⚠️ حدود الدراسة والقيود العلمية:
━━━━━━━━━━━━━━━━━━━━━
الدراسة لها حدود، أهمها [الـ Limitation بدقة علمية]، لذلك لا يصح تعميم النتيجة على [الفئات المستثناة] دون أدلة إضافية.

━━━━━━━━━━━━━━━━━━━━━
🎯 الخلاصة:
━━━━━━━━━━━━━━━━━━━━━
لا تقرأ الورقة العلمية فقط لتعرف ماذا وجد الباحثون.
اقرأها لتسأل:
"ماذا يمكنني أن أفعل بشكل مختلف بسبب هذه النتيجة؟"

📚 Source: ${paper.journal}
🔗 DOI / PubMed: ${doiUrl}

سؤالي لك:
هل تعتقد أن [سؤال تفاعلي ذكي يدعو كبار الأطباء والباحثين للمناقشة في التعليقات]؟
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'أنت عالم أورام بارز وخبير علمي مرموق، تكتب باللغة العربية الفصحى بأعلى درجات الدقة الأكاديمية والجاذبية اللغوية، وتلتزم بالقالب المعتمد ووضع الروابط والـ DOI الصحيحة دون أي اختلاق.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            facebookPost: {
              type: Type.STRING,
              description: 'نص منشور الفيسبوك الكامل متوافق مع القالب بدقة واحترافية فائقة',
            },
            linkedinPost: {
              type: Type.STRING,
              description: 'نص منشور لينكد إن الكامل متوافق مع القالب بدقة واحترافية فائقة',
            },
            catchyHook: {
              type: Type.STRING,
              description: 'جملة افتتاحية مبهرة ومثيرة للاهتمام',
            },
            keyInsight: {
              type: Type.STRING,
              description: 'الفائدة العملية الأهم من الورقة',
            },
          },
          required: ['facebookPost', 'linkedinPost', 'catchyHook', 'keyInsight'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/generate-post:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate social media post' });
  }
});

// Serve Vite build in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Ovarian Research Radar] Server listening on port ${PORT}`);
});

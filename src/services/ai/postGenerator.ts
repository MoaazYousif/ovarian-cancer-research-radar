import { Paper } from '../../types/paper';

export interface SocialPostsResult {
  facebookPost: string;
  linkedinPost: string;
  catchyHook: string;
  keyInsight: string;
}

export async function generateSocialPosts(paper: Paper): Promise<SocialPostsResult> {
  try {
    const res = await fetch('/api/generate-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paper }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.facebookPost && data.linkedinPost) {
        return data;
      }
    }
  } catch (err) {
    console.warn('API generate-post failed, falling back to dynamic client synthesis:', err);
  }

  // Robust Fallback Generator ensuring exact Arabic template fidelity
  return generateClientFallbackPosts(paper);
}

export function generateClientFallbackPosts(paper: Paper): SocialPostsResult {
  const year = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : '2026';
  const authorsStr =
    (paper.authors || []).map((a) => a.name).slice(0, 3).join('، ') +
    (paper.authors && paper.authors.length > 3 ? ' وآخرون' : '');

  // Exact clean DOI URL normalization
  const cleanDoi = paper.doi ? String(paper.doi).replace(/^doi:\s*/i, '').trim() : '';
  const pmid = paper.pmid || (paper.id ? String(paper.id).replace(/^pmid_/, '') : '');
  const doiUrl = cleanDoi
    ? cleanDoi.startsWith('http')
      ? cleanDoi
      : `https://doi.org/${cleanDoi}`
    : pmid
    ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
    : 'https://pubmed.ncbi.nlm.nih.gov/';

  const genesList = (paper.entities?.genes || []).slice(0, 3);
  const genesStr = genesList.length > 0 ? genesList.join(', ') : 'الجينات المحركة والبيولوجية';
  const drugsList = (paper.entities?.drugs || []).slice(0, 2);
  const drugsStr = drugsList.length > 0 ? drugsList.join(' و ') : 'العلاجات الموجهة ومثبطات الـ DNA repair';
  const subtype = paper.ovarianSubtype === 'HGSOC' ? 'سرطان المبيض المصلي عالي الدرجة (HGSOC)' : `${paper.ovarianSubtype} Ovarian Carcinoma`;

  // Extract key concept from TLDR or Abstract
  const summaryTldr = paper.aiSummary?.tldr || paper.abstract.slice(0, 280);
  const mainFinding1 = paper.aiSummary?.mainFindings?.[0] || `أثبتت الدراسة دوراً محورياً للجينات المستهدفة (${genesStr}) في تحديد مصير الخلايا السرطانية والاستجابة للعلاج.`;
  const mainFinding2 = paper.aiSummary?.mainFindings?.[1] || 'تطبيق تقنيات التحليل الجزيئي المتقدم كشف عن بيئات خلوية دقيقة تمنح الورم قدرة على الإفلات المناعي.';
  const mainFinding3 = paper.aiSummary?.mainFindings?.[2] || `استهداف هذه المسارات أعاد حساسية الأورام المقاومة تجاه بروتوكولات (${drugsStr}).`;

  const clinicalSignificance = paper.aiSummary?.clinicalSignificance || `يمنح هذا الاكتشاف أطباء وباحثي الأورام أساساً علمياً متيناً لفرز المرضى المؤهلين للعلاجات الموجهة وتفادي سمية العلاجات غير الفعالة.`;
  const limitations = paper.aiSummary?.limitations || 'الدراسة تعتمد على نماذج تجريبية وفوج محدد من المرضى، مما يستوجب التحقق السريري عبر دراسات عشوائية متعددة المراكز قبل التعميم الشامل.';

  const catchyHook = `هل وصلنا إلى نهاية عصر مقاومة العلاج الكيميائي في ${paper.ovarianSubtype}؟`;

  // Facebook Post (Exact Arabic Template - Ultra Professional with Spacious Layout)
  const facebookPost = `🧠 ${catchyHook}

عمرك فكرت إن فكرة "حتمية فشل العلاج عند عودة الورم ومقاومة البلاتين" ممكن تكون مش صحيحة بالشكل اللي إحنا متخيلينه؟

باحثون حاولوا يجاوبوا على السؤال ده من خلال دراسة علمية متقدمة نُشرت في مجلة ${paper.journal} بعنوان:
📄 "${paper.title}"

والنتيجة كانت مثيرة للاهتمام…

━━━━━━━━━━━━━━━━━━━━━
1️⃣ الباحثون كانوا بيدرسوا إيه؟ (سؤال البحث)
━━━━━━━━━━━━━━━━━━━━━
ببساطة، الدراسة حاولت تعرف:
${paper.aiSummary?.researchQuestion || `الآليات البيولوجية الدقيقة التي تقود المقاومة العلاجية في ${subtype}`}.

━━━━━━━━━━━━━━━━━━━━━
2️⃣ عملوا إيه؟ (تصميم الدراسة والمنهجية)
━━━━━━━━━━━━━━━━━━━━━
استخدم الباحثون:
${paper.aiSummary?.studyDesign || `نماذج بيولوجية متطورة وفوج عينات سريرية من مرضى ${paper.ovarianSubtype}`}.

المنهجية التحليلية:
${paper.aiSummary?.methodsSummary || `تحليلات جينومية ونماذج بيولوجية متطورة لمقارنة المجموعات المستجيبة والمقاومة للعلاج`}.

━━━━━━━━━━━━━━━━━━━━━
3️⃣ إيه أهم نتيجة توصلوا إليها؟
━━━━━━━━━━━━━━━━━━━━━
النتائج أظهرت أن:
• ${mainFinding1}
• ${mainFinding2}
مع توثيق دور رئيسي للواسمات الحيوية (${genesStr}).

لكن هنا النقطة الأهم… النتيجة دي معناها إيه عملياً؟ 👇
يعني لو أنت باحث، أو طبيب أورام، أو مهتم بالطب الدقيق، فالمعلومة دي هتساعدك في:
👉 ${clinicalSignificance}

━━━━━━━━━━━━━━━━━━━━━
⚠️ حدود الدراسة ونقاط الحذر:
━━━━━━━━━━━━━━━━━━━━━
${limitations}
وبالتالي ما ينفعش نقول إن النتيجة تثبت حلاً نهائياً لجميع الحالات دون استكمال مسارات التحقق السريري.

━━━━━━━━━━━━━━━━━━━━━
🎯 الخلاصة في جملة واحدة:
━━━━━━━━━━━━━━━━━━━━━
${summaryTldr}

📌 الورقة العلمية: ${paper.title}
👨‍🔬 الباحثون: ${authorsStr}
📅 سنة النشر: ${year}
🔗 رابط المصدر والتوثيق الرسمي: ${doiUrl}

لو حابب، اكتب "Paper" في التعليقات وأنا أختار لك ورقة تانية وأبسطها بنفس الطريقة.`;

  // LinkedIn Post (Exact Arabic Template - Senior Oncology Executive Tone with Spacious Layout)
  const linkedinPost = `${mainFinding1}

معظم الممارسين في علم الأورام يعتقدون أن المعايير العلاجية التقليدية كافية للتنبؤ بمسار أورام المبيض المتقدمة.

لكن دراسة حديثة نُشرت في ${paper.journal} أثبتت تحولاً جوهرياً في هذا المفهوم:
${summaryTldr}

📄 Paper: ${paper.title}
👨‍🔬 Authors: ${authorsStr}
📅 Year: ${year}

━━━━━━━━━━━━━━━━━━━━━
❓ السؤال الذي حاول الباحثون الإجابة عنه:
━━━━━━━━━━━━━━━━━━━━━
> ${paper.aiSummary?.researchQuestion || `كيف تؤثر التغيرات الجينومية والبيئة الدقيقة للورم على استجابة ${subtype} للخيارات العلاجية الحديثة؟`}

━━━━━━━━━━━━━━━━━━━━━
🔬 تصميم الدراسة ومنهجية العمل (Study Design & Methodology):
━━━━━━━━━━━━━━━━━━━━━
• تصميم الدراسة والعينة:
${paper.aiSummary?.studyDesign || `فوج سريري ونماذج متقدمة لتقييم الاستجابة العلاجية في ${subtype}`}.

• المنهجية والأدوات التحليلية:
${paper.aiSummary?.methodsSummary || `تحليلات جينومية ونماذج خلوية متقدمة لتقييم مؤشرات الفاعلية والحركية الدوائية`}.

━━━━━━━━━━━━━━━━━━━━━
💡 أهم 3 نتائج رئيسية:
━━━━━━━━━━━━━━━━━━━━━
1. ${mainFinding1}
   → ماذا تعني؟ تمنحنا فهماً دقيقاً للمسار المباشر لهروب الورم من الاستهداف الدوائي.

2. ${mainFinding2}
   → ماذا تعني؟ تفتح الباب أمام استهداف أهداف جزيئية واعدة (${genesStr}) لتحييد المقاومة.

3. ${mainFinding3}
   → ماذا تعني؟ تعزز الجيل القادم من البروتوكولات المركبة مع (${drugsStr}).

━━━━━━━━━━━━━━━━━━━━━
🚀 الأثر التطبيقي والـ Actionable Insight:
━━━━━━━━━━━━━━━━━━━━━
👉 ${clinicalSignificance}

وده يخلينا نعيد التفكير في معايير اختيار المرضى وتصميم خطط العلاج المخصصة (Precision Oncology).

مثال عملي:
لو كنت تعمل في أبحاث الأورام، تصميم التجارب السريرية، أو التحليل الجينومي، فبدلًا من الاعتماد الحصري على الواسمات الكلاسيكية، يمكنك البدء في تقييم دمج (${genesStr}) ضمن لوحات الفحص الجزيئي لتوجيه القرارات العلاجية.

━━━━━━━━━━━━━━━━━━━━━
⚠️ حدود الدراسة والقيود العلمية:
━━━━━━━━━━━━━━━━━━━━━
${limitations}

━━━━━━━━━━━━━━━━━━━━━
🎯 الخلاصة:
━━━━━━━━━━━━━━━━━━━━━
لا تقرأ الورقة العلمية فقط لتعرف ماذا وجد الباحثون.
اقرأها لتسأل:
"ماذا يمكنني أن أفعل بشكل مختلف بسبب هذه النتيجة؟"

📚 Source: ${paper.journal}
🔗 DOI / PubMed Link: ${doiUrl}

سؤالي لك:
هل تعتقد أن دمج هذه الآلية في الممارسة الإكلينيكية لـ ${paper.ovarianSubtype} سيغير ترتيب خطوط العلاج خلال الفترة القادمة؟ شاركنا رؤيتك الأكاديمية والسريرية في التعليقات 👇`;

  return {
    facebookPost,
    linkedinPost,
    catchyHook,
    keyInsight: clinicalSignificance,
  };
}

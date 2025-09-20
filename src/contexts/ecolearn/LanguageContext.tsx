import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Language {
  code: string;
  name: string;
}

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  availableLanguages: Language[];
}

const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' }
];

const translations: { [key: string]: Translations } = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    modules: 'Learning Modules',
    progress: 'Progress',
    certificate: 'Certificate',
    
    // Dashboard
    welcome: 'Welcome to EcoLearn',
    subtitle: 'Master sustainable waste management practices',
    getstarted: 'Get Started',
    viewprogress: 'View Progress',
    
    // Modules
    wastesorting: 'Waste Sorting & Classification',
    wastesortingDesc: 'Learn to identify and categorize different types of waste materials',
    recycling: 'Recycling Best Practices',
    recyclingDesc: 'Discover effective recycling techniques and processes',
    composting: 'Composting & Organic Waste',
    compostingDesc: 'Master the art of turning organic waste into valuable compost',
    hazardouswaste: 'Hazardous Waste Management',
    hazardouswasteDesc: 'Safely handle and dispose of hazardous materials',
    
    // Progress
    overallprogress: 'Overall Progress',
    completed: 'Completed',
    inprogress: 'In Progress',
    notstarted: 'Not Started',
    
    // Common
    start: 'Start',
    continue: 'Continue',
    complete: 'Complete',
    question: 'Question',
    submit: 'Submit',
    congratulations: 'Congratulations!',
    moduleCompleted: 'Module Completed Successfully!',
    completionDate: 'Completion Date',
    validUntil: 'Valid Until',
    downloadCertificate: 'Download Certificate',
    backToDashboard: 'Back to Dashboard',
    previousSection: 'Previous Section',
    nextSection: 'Next Section',
    takeQuiz: 'Take Quiz',
    overall: 'Overall',
    hazardous: 'Hazardous Waste Management',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success'
  },
  es: {
    // Navigation
    dashboard: 'Panel de Control',
    modules: 'Módulos de Aprendizaje',
    progress: 'Progreso',
    certificate: 'Certificado',
    
    // Dashboard
    welcome: 'Bienvenido a EcoLearn',
    subtitle: 'Domina las prácticas sostenibles de gestión de residuos',
    getstarted: 'Comenzar',
    viewprogress: 'Ver Progreso',
    
    // Modules
    wastesorting: 'Clasificación y Separación de Residuos',
    wastesortingDesc: 'Aprende a identificar y categorizar diferentes tipos de materiales de desecho',
    recycling: 'Mejores Prácticas de Reciclaje',
    recyclingDesc: 'Descubre técnicas y procesos efectivos de reciclaje',
    composting: 'Compostaje y Residuos Orgánicos',
    compostingDesc: 'Domina el arte de convertir residuos orgánicos en compost valioso',
    hazardouswaste: 'Gestión de Residuos Peligrosos',
    hazardouswasteDesc: 'Maneja y desecha materiales peligrosos de forma segura',
    
    // Progress
    overallprogress: 'Progreso General',
    completed: 'Completado',
    inprogress: 'En Progreso',
    notstarted: 'No Iniciado',
    
    // Common
    start: 'Iniciar',
    continue: 'Continuar',
    complete: 'Completar',
    question: 'Pregunta',
    submit: 'Enviar',
    congratulations: '¡Felicitaciones!',
    moduleCompleted: '¡Módulo Completado Exitosamente!',
    completionDate: 'Fecha de Finalización',
    validUntil: 'Válido Hasta',
    downloadCertificate: 'Descargar Certificado',
    backToDashboard: 'Volver al Panel',
    previousSection: 'Sección Anterior',
    nextSection: 'Siguiente Sección',
    takeQuiz: 'Tomar Examen',
    overall: 'General',
    hazardous: 'Gestión de Residuos Peligrosos',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    cancel: 'Cancelar',
    save: 'Guardar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito'
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de Bord',
    modules: 'Modules d\'Apprentissage',
    progress: 'Progrès',
    certificate: 'Certificat',
    
    // Dashboard
    welcome: 'Bienvenue sur EcoLearn',
    subtitle: 'Maîtrisez les pratiques durables de gestion des déchets',
    getstarted: 'Commencer',
    viewprogress: 'Voir les Progrès',
    
    // Modules
    wastesorting: 'Tri et Classification des Déchets',
    wastesortingDesc: 'Apprenez à identifier et catégoriser différents types de matériaux de déchets',
    recycling: 'Meilleures Pratiques de Recyclage',
    recyclingDesc: 'Découvrez des techniques et processus de recyclage efficaces',
    composting: 'Compostage et Déchets Organiques',
    compostingDesc: 'Maîtrisez l\'art de transformer les déchets organiques en compost précieux',
    hazardouswaste: 'Gestion des Déchets Dangereux',
    hazardouswasteDesc: 'Manipulez et éliminez les matériaux dangereux en toute sécurité',
    
    // Progress
    overallprogress: 'Progrès Global',
    completed: 'Terminé',
    inprogress: 'En Cours',
    notstarted: 'Non Commencé',
    
    // Common
    start: 'Commencer',
    continue: 'Continuer',
    complete: 'Terminer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    submit: 'Soumettre',
    cancel: 'Annuler',
    save: 'Sauvegarder',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès'
  },
  de: {
    // Navigation
    dashboard: 'Dashboard',
    modules: 'Lernmodule',
    progress: 'Fortschritt',
    certificate: 'Zertifikat',
    
    // Dashboard
    welcome: 'Willkommen bei EcoLearn',
    subtitle: 'Meistern Sie nachhaltige Abfallmanagement-Praktiken',
    getstarted: 'Loslegen',
    viewprogress: 'Fortschritt Anzeigen',
    
    // Modules
    wastesorting: 'Abfalltrennung & Klassifizierung',
    wastesortingDesc: 'Lernen Sie verschiedene Arten von Abfallmaterialien zu identifizieren und zu kategorisieren',
    recycling: 'Recycling Best Practices',
    recyclingDesc: 'Entdecken Sie effektive Recycling-Techniken und -Prozesse',
    composting: 'Kompostierung & Organische Abfälle',
    compostingDesc: 'Meistern Sie die Kunst, organische Abfälle in wertvollen Kompost zu verwandeln',
    hazardouswaste: 'Gefährliche Abfallentsorgung',
    hazardouswasteDesc: 'Sicherer Umgang und Entsorgung gefährlicher Materialien',
    
    // Progress
    overallprogress: 'Gesamtfortschritt',
    completed: 'Abgeschlossen',
    inprogress: 'In Bearbeitung',
    notstarted: 'Nicht Begonnen',
    
    // Common
    start: 'Starten',
    continue: 'Fortsetzen',
    complete: 'Abschließen',
    back: 'Zurück',
    next: 'Weiter',
    previous: 'Vorherige',
    submit: 'Senden',
    cancel: 'Abbrechen',
    save: 'Speichern',
    loading: 'Laden...',
    error: 'Fehler',
    success: 'Erfolg'
  },
  it: {
    // Navigation
    dashboard: 'Dashboard',
    modules: 'Moduli di Apprendimento',
    progress: 'Progresso',
    certificate: 'Certificato',
    
    // Dashboard
    welcome: 'Benvenuto su EcoLearn',
    subtitle: 'Padroneggia le pratiche sostenibili di gestione dei rifiuti',
    getstarted: 'Inizia',
    viewprogress: 'Visualizza Progresso',
    
    // Modules
    wastesorting: 'Smistamento e Classificazione Rifiuti',
    wastesortingDesc: 'Impara a identificare e categorizzare diversi tipi di materiali di scarto',
    recycling: 'Migliori Pratiche di Riciclaggio',
    recyclingDesc: 'Scopri tecniche e processi di riciclaggio efficaci',
    composting: 'Compostaggio e Rifiuti Organici',
    compostingDesc: 'Padroneggia l\'arte di trasformare i rifiuti organici in compost prezioso',
    hazardouswaste: 'Gestione Rifiuti Pericolosi',
    hazardouswasteDesc: 'Maneggia e smaltisci materiali pericolosi in sicurezza',
    
    // Progress
    overallprogress: 'Progresso Complessivo',
    completed: 'Completato',
    inprogress: 'In Corso',
    notstarted: 'Non Iniziato',
    
    // Common
    start: 'Inizia',
    continue: 'Continua',
    complete: 'Completa',
    back: 'Indietro',
    next: 'Avanti',
    previous: 'Precedente',
    submit: 'Invia',
    cancel: 'Annulla',
    save: 'Salva',
    loading: 'Caricamento...',
    error: 'Errore',
    success: 'Successo'
  },
  pt: {
    // Navigation
    dashboard: 'Painel',
    modules: 'Módulos de Aprendizagem',
    progress: 'Progresso',
    certificate: 'Certificado',
    
    // Dashboard
    welcome: 'Bem-vindo ao EcoLearn',
    subtitle: 'Domine práticas sustentáveis de gestão de resíduos',
    getstarted: 'Começar',
    viewprogress: 'Ver Progresso',
    
    // Modules
    wastesorting: 'Triagem e Classificação de Resíduos',
    wastesortingDesc: 'Aprenda a identificar e categorizar diferentes tipos de materiais residuais',
    recycling: 'Melhores Práticas de Reciclagem',
    recyclingDesc: 'Descubra técnicas e processos eficazes de reciclagem',
    composting: 'Compostagem e Resíduos Orgânicos',
    compostingDesc: 'Domine a arte de transformar resíduos orgânicos em composto valioso',
    hazardouswaste: 'Gestão de Resíduos Perigosos',
    hazardouswasteDesc: 'Manuseie e descarte materiais perigosos com segurança',
    
    // Progress
    overallprogress: 'Progresso Geral',
    completed: 'Concluído',
    inprogress: 'Em Andamento',
    notstarted: 'Não Iniciado',
    
    // Common
    start: 'Iniciar',
    continue: 'Continuar',
    complete: 'Completar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    submit: 'Enviar',
    cancel: 'Cancelar',
    save: 'Salvar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso'
  },
  ru: {
    // Navigation
    dashboard: 'Панель управления',
    modules: 'Модули обучения',
    progress: 'Прогресс',
    certificate: 'Сертификат',
    
    // Dashboard
    welcome: 'Добро пожаловать в EcoLearn',
    subtitle: 'Освойте устойчивые практики управления отходами',
    getstarted: 'Начать',
    viewprogress: 'Посмотреть прогресс',
    
    // Modules
    wastesorting: 'Сортировка и классификация отходов',
    wastesortingDesc: 'Научитесь определять и категоризировать различные типы отходов',
    recycling: 'Лучшие практики переработки',
    recyclingDesc: 'Откройте для себя эффективные методы и процессы переработки',
    composting: 'Компостирование и органические отходы',
    compostingDesc: 'Освойте искусство превращения органических отходов в ценный компост',
    hazardouswaste: 'Управление опасными отходами',
    hazardouswasteDesc: 'Безопасно обращайтесь и утилизируйте опасные материалы',
    
    // Progress
    overallprogress: 'Общий прогресс',
    completed: 'Завершено',
    inprogress: 'В процессе',
    notstarted: 'Не начато',
    
    // Common
    start: 'Начать',
    continue: 'Продолжить',
    complete: 'Завершить',
    back: 'Назад',
    next: 'Далее',
    previous: 'Предыдущий',
    submit: 'Отправить',
    cancel: 'Отмена',
    save: 'Сохранить',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успех'
  },
  zh: {
    // Navigation
    dashboard: '仪表板',
    modules: '学习模块',
    progress: '进度',
    certificate: '证书',
    
    // Dashboard
    welcome: '欢迎来到 EcoLearn',
    subtitle: '掌握可持续废物管理实践',
    getstarted: '开始',
    viewprogress: '查看进度',
    
    // Modules
    wastesorting: '废物分类与分类',
    wastesortingDesc: '学习识别和分类不同类型的废料',
    recycling: '回收最佳实践',
    recyclingDesc: '发现有效的回收技术和流程',
    composting: '堆肥和有机废物',
    compostingDesc: '掌握将有机废物转化为有价值堆肥的艺术',
    hazardouswaste: '危险废物管理',
    hazardouswasteDesc: '安全处理和处置危险材料',
    
    // Progress
    overallprogress: '总体进度',
    completed: '已完成',
    inprogress: '进行中',
    notstarted: '未开始',
    
    // Common
    start: '开始',
    continue: '继续',
    complete: '完成',
    back: '返回',
    next: '下一个',
    previous: '上一个',
    submit: '提交',
    cancel: '取消',
    save: '保存',
    loading: '加载中...',
    error: '错误',
    success: '成功'
  },
  ja: {
    // Navigation
    dashboard: 'ダッシュボード',
    modules: '学習モジュール',
    progress: '進捗',
    certificate: '証明書',
    
    // Dashboard
    welcome: 'EcoLearnへようこそ',
    subtitle: '持続可能な廃棄物管理の実践をマスターしましょう',
    getstarted: '始める',
    viewprogress: '進捗を見る',
    
    // Modules
    wastesorting: '廃棄物の分別と分類',
    wastesortingDesc: 'さまざまな種類の廃棄物材料を識別し分類することを学びます',
    recycling: 'リサイクルのベストプラクティス',
    recyclingDesc: '効果的なリサイクル技術とプロセスを発見します',
    composting: 'コンポストと有機廃棄物',
    compostingDesc: '有機廃棄物を価値あるコンポストに変える技術をマスターします',
    hazardouswaste: '有害廃棄物管理',
    hazardouswasteDesc: '有害物質を安全に取り扱い処分します',
    
    // Progress
    overallprogress: '全体の進捗',
    completed: '完了',
    inprogress: '進行中',
    notstarted: '未開始',
    
    // Common
    start: '開始',
    continue: '続行',
    complete: '完了',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    submit: '送信',
    cancel: 'キャンセル',
    save: '保存',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功'
  },
  ko: {
    // Navigation
    dashboard: '대시보드',
    modules: '학습 모듈',
    progress: '진행률',
    certificate: '인증서',
    
    // Dashboard
    welcome: 'EcoLearn에 오신 것을 환영합니다',
    subtitle: '지속 가능한 폐기물 관리 실무를 마스터하세요',
    getstarted: '시작하기',
    viewprogress: '진행률 보기',
    
    // Modules
    wastesorting: '폐기물 분류 및 분류',
    wastesortingDesc: '다양한 유형의 폐기물 재료를 식별하고 분류하는 방법을 배웁니다',
    recycling: '재활용 모범 사례',
    recyclingDesc: '효과적인 재활용 기술과 프로세스를 발견합니다',
    composting: '퇴비화 및 유기 폐기물',
    compostingDesc: '유기 폐기물을 가치 있는 퇴비로 바꾸는 기술을 마스터합니다',
    hazardouswaste: '유해 폐기물 관리',
    hazardouswasteDesc: '유해 물질을 안전하게 취급하고 처리합니다',
    
    // Progress
    overallprogress: '전체 진행률',
    completed: '완료됨',
    inprogress: '진행 중',
    notstarted: '시작되지 않음',
    
    // Common
    start: '시작',
    continue: '계속',
    complete: '완료',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    submit: '제출',
    cancel: '취소',
    save: '저장',
    loading: '로딩 중...',
    error: '오류',
    success: '성공'
  },
  ar: {
    // Navigation
    dashboard: 'لوحة التحكم',
    modules: 'وحدات التعلم',
    progress: 'التقدم',
    certificate: 'الشهادة',
    
    // Dashboard
    welcome: 'مرحباً بك في EcoLearn',
    subtitle: 'أتقن ممارسات إدارة النفايات المستدامة',
    getstarted: 'ابدأ',
    viewprogress: 'عرض التقدم',
    
    // Modules
    wastesorting: 'فرز وتصنيف النفايات',
    wastesortingDesc: 'تعلم كيفية تحديد وتصنيف أنواع مختلفة من مواد النفايات',
    recycling: 'أفضل ممارسات إعادة التدوير',
    recyclingDesc: 'اكتشف تقنيات وعمليات إعادة التدوير الفعالة',
    composting: 'التسميد والنفايات العضوية',
    compostingDesc: 'أتقن فن تحويل النفايات العضوية إلى سماد قيم',
    hazardouswaste: 'إدارة النفايات الخطرة',
    hazardouswasteDesc: 'التعامل الآمن والتخلص من المواد الخطرة',
    
    // Progress
    overallprogress: 'التقدم العام',
    completed: 'مكتمل',
    inprogress: 'قيد التقدم',
    notstarted: 'لم يبدأ',
    
    // Common
    start: 'ابدأ',
    continue: 'متابعة',
    complete: 'إكمال',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    cancel: 'إلغاء',
    save: 'حفظ',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح'
  },
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    modules: 'शिक्षण मॉड्यूल',
    progress: 'प्रगति',
    certificate: 'प्रमाणपत्र',
    
    // Dashboard
    welcome: 'EcoLearn में आपका स्वागत है',
    subtitle: 'टिकाऊ अपशिष्ट प्रबंधन प्रथाओं में महारत हासिल करें',
    getstarted: 'शुरू करें',
    viewprogress: 'प्रगति देखें',
    
    // Modules
    wastesorting: 'अपशिष्ट छंटाई और वर्गीकरण',
    wastesortingDesc: 'विभिन्न प्रकार की अपशिष्ट सामग्री की पहचान और वर्गीकरण करना सीखें',
    recycling: 'रीसाइक्लिंग की सर्वोत्तम प्रथाएं',
    recyclingDesc: 'प्रभावी रीसाइक्लिंग तकनीकों और प्रक्रियाओं की खोज करें',
    composting: 'कंपोस्टिंग और जैविक अपशिष्ट',
    compostingDesc: 'जैविक अपशिष्ट को मूल्यवान कंपोस्ट में बदलने की कला में महारत हासिल करें',
    hazardouswaste: 'खतरनाक अपशिष्ट प्रबंधन',
    hazardouswasteDesc: 'खतरनाक सामग्री को सुरक्षित रूप से संभालें और निपटान करें',
    
    // Progress
    overallprogress: 'समग्र प्रगति',
    completed: 'पूर्ण',
    inprogress: 'प्रगति में',
    notstarted: 'शुरू नहीं हुआ',
    
    // Common
    start: 'शुरू करें',
    continue: 'जारी रखें',
    complete: 'पूर्ण करें',
    back: 'वापस',
    next: 'अगला',
    previous: 'पिछला',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    availableLanguages: languages
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
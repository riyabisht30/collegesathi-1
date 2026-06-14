'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { College, QuestionnaireData } from '@/types';
import CollegeCard from '@/components/CollegeCard';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 'course_level', title: 'What are you looking for?', subtitle: 'Select your course level' },
  { id: 'streams', title: 'Which stream?', subtitle: 'Choose one or more streams' },
  { id: 'entrance_exams', title: 'Which exams have you given?', subtitle: 'Select all that apply' },
  { id: 'exam_scores', title: 'Your scores', subtitle: 'Help us find colleges you qualify for' },
  { id: 'preferred_states', title: 'Preferred locations?', subtitle: 'Where would you like to study?' },
  { id: 'budget', title: 'Your budget', subtitle: 'Annual fee you can afford' },
  { id: 'college_type', title: 'College preference', subtitle: 'Government, Private, or both?' },
];

const COURSE_LEVELS = [
  { value: 'UG', label: 'Undergraduate (B.Tech, BA, B.Sc, BBA, MBBS...)', icon: '🎓' },
  { value: 'PG', label: 'Postgraduate (M.Tech, MA, MBA, MD...)', icon: '📚' },
  { value: 'PhD', label: 'Doctorate (PhD)', icon: '🔬' },
];

const STREAMS = [
  { value: 'Engineering', label: 'Engineering & Technology', icon: '⚙️' },
  { value: 'Medical', label: 'Medical & Health Sciences', icon: '🏥' },
  { value: 'Science', label: 'Pure Sciences', icon: '🔬' },
  { value: 'Commerce', label: 'Commerce & Management', icon: '📊' },
  { value: 'Arts', label: 'Arts & Humanities', icon: '📖' },
  { value: 'Law', label: 'Law', icon: '⚖️' },
  { value: 'Design', label: 'Design & Architecture', icon: '🎨' },
];

const ENTRANCE_EXAMS = [
  { value: 'JEE_MAINS', label: 'JEE Mains', stream: 'Engineering', scoreType: 'percentile', placeholder: 'Percentile (e.g. 95.5)' },
  { value: 'JEE_ADVANCED', label: 'JEE Advanced', stream: 'Engineering', scoreType: 'rank', placeholder: 'AIR Rank (e.g. 5000)' },
  { value: 'BITSAT', label: 'BITSAT', stream: 'Engineering', scoreType: 'score', placeholder: 'Score out of 390' },
  { value: 'VITEEE', label: 'VITEEE', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 10000)' },
  { value: 'SRMJEEE', label: 'SRMJEEE', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 8000)' },
  { value: 'MHT_CET', label: 'MHT CET', stream: 'Engineering', scoreType: 'percentile', placeholder: 'Percentile (e.g. 92.3)' },
  { value: 'KCET', label: 'KCET (Karnataka)', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 5000)' },
  { value: 'WBJEE', label: 'WBJEE', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 3000)' },
  { value: 'COMEDK', label: 'COMEDK', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 8000)' },
  { value: 'MET', label: 'Manipal MET', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 5000)' },
  { value: 'AEEE', label: 'Amrita AEEE', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 10000)' },
  { value: 'KIITEE', label: 'KIITEE', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 15000)' },
  { value: 'IPU_CET', label: 'IPU CET', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 5000)' },
  { value: 'UPSEE', label: 'UPSEE/AKTU', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 20000)' },
  { value: 'TS_EAMCET', label: 'TS EAMCET', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 10000)' },
  { value: 'AP_EAMCET', label: 'AP EAMCET', stream: 'Engineering', scoreType: 'rank', placeholder: 'Rank (e.g. 10000)' },
  { value: 'NEET', label: 'NEET UG', stream: 'Medical', scoreType: 'score', placeholder: 'Score out of 720' },
  { value: 'NEET_PG', label: 'NEET PG', stream: 'Medical', scoreType: 'score', placeholder: 'Score (e.g. 450)' },
  { value: 'CUET', label: 'CUET (UG)', stream: 'Arts', scoreType: 'percentile', placeholder: 'Percentile (e.g. 90)' },
  { value: 'CUET_PG', label: 'CUET (PG)', stream: 'Arts', scoreType: 'score', placeholder: 'Score (e.g. 350)' },
  { value: 'DUET', label: 'Delhi University (DUET)', stream: 'Arts', scoreType: 'percentile', placeholder: 'Percentile (e.g. 95)' },
  { value: 'CAT', label: 'CAT', stream: 'Commerce', scoreType: 'percentile', placeholder: 'Percentile (e.g. 98.5)' },
  { value: 'XAT', label: 'XAT', stream: 'Commerce', scoreType: 'percentile', placeholder: 'Percentile (e.g. 95)' },
  { value: 'MAT', label: 'MAT', stream: 'Commerce', scoreType: 'score', placeholder: 'Score out of 800' },
  { value: 'SET', label: 'Symbiosis SET', stream: 'Commerce', scoreType: 'percentile', placeholder: 'Percentile (e.g. 85)' },
  { value: 'CLAT', label: 'CLAT', stream: 'Law', scoreType: 'score', placeholder: 'Score out of 150' },
  { value: 'AILET', label: 'AILET', stream: 'Law', scoreType: 'score', placeholder: 'Score out of 150' },
  { value: 'LSAT_INDIA', label: 'LSAT India', stream: 'Law', scoreType: 'score', placeholder: 'Score (e.g. 80)' },
  { value: 'GATE', label: 'GATE', stream: 'Engineering', scoreType: 'score', placeholder: 'Score out of 100' },
  { value: 'JAM', label: 'IIT JAM', stream: 'Science', scoreType: 'score', placeholder: 'Score out of 100' },
  { value: 'NATA', label: 'NATA', stream: 'Design', scoreType: 'score', placeholder: 'Score out of 200' },
];

const STATES = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
  'West Bengal', 'Rajasthan', 'Gujarat', 'Madhya Pradesh', 'Telangana',
  'Andhra Pradesh', 'Kerala', 'Punjab', 'Haryana', 'Bihar',
  'Odisha', 'Jharkhand', 'Assam', 'Uttarakhand', 'Himachal Pradesh',
  'Goa', 'Chandigarh', 'Jammu and Kashmir', 'Puducherry',
];

const BUDGET_OPTIONS = [
  { value: 50000, label: 'Under ₹50K/year' },
  { value: 100000, label: 'Under ₹1 Lakh/year' },
  { value: 200000, label: 'Under ₹2 Lakhs/year' },
  { value: 500000, label: 'Under ₹5 Lakhs/year' },
  { value: 1000000, label: 'Under ₹10 Lakhs/year' },
  { value: 2000000, label: 'Under ₹20 Lakhs/year' },
  { value: 0, label: 'No budget constraint' },
];

const COLLEGE_TYPES = [
  { value: 'Government', label: 'Government', desc: 'Lower fees, competitive' },
  { value: 'Private', label: 'Private', desc: 'More seats, higher fees' },
  { value: 'Deemed', label: 'Deemed University', desc: 'Autonomous, varied fees' },
  { value: 'Autonomous', label: 'Autonomous', desc: 'Self-governing colleges' },
];

const INITIAL_ANSWERS: QuestionnaireData = {
  preferred_states: [],
  course_level: '',
  streams: [],
  budget_max: null,
  entrance_exams: [],
  exam_scores: {},
  college_type: [],
  preferred_city: null,
};

/** Keep only exams (and scores) that belong to currently selected streams. */
function pruneExamsForStreams(
  streams: string[],
  entrance_exams: string[],
  exam_scores: Record<string, number>,
) {
  const allowed = new Set(
    ENTRANCE_EXAMS.filter((e) => streams.length === 0 || streams.includes(e.stream)).map((e) => e.value)
  );
  const keptExams = entrance_exams.filter((code) => allowed.has(code));
  const keptScores: Record<string, number> = {};
  for (const code of keptExams) {
    if (exam_scores[code] !== undefined) {
      keptScores[code] = exam_scores[code];
    }
  }
  return { entrance_exams: keptExams, exam_scores: keptScores };
}

export default function RecommendPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireData>({ ...INITIAL_ANSWERS });
  const [results, setResults] = useState<College[] | null>(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[step];

  const resetQuiz = () => {
    setResults(null);
    setStep(0);
    setAnswers({ ...INITIAL_ANSWERS });
  };

  const toggleArray = (key: keyof QuestionnaireData, value: string) => {
    const arr = answers[key] as string[];
    if (arr.includes(value)) {
      setAnswers({ ...answers, [key]: arr.filter((v) => v !== value) });
    } else {
      setAnswers({ ...answers, [key]: [...arr, value] });
    }
  };

  const toggleStream = (stream: string) => {
    const streams = answers.streams.includes(stream)
      ? answers.streams.filter((s) => s !== stream)
      : [...answers.streams, stream];
    const pruned = pruneExamsForStreams(streams, answers.entrance_exams, answers.exam_scores);
    setAnswers({ ...answers, streams, ...pruned });
  };

  const toggleEntranceExam = (examCode: string) => {
    const isSelected = answers.entrance_exams.includes(examCode);
    const entrance_exams = isSelected
      ? answers.entrance_exams.filter((e) => e !== examCode)
      : [...answers.entrance_exams, examCode];
    const exam_scores = { ...answers.exam_scores };
    if (isSelected) {
      delete exam_scores[examCode];
    }
    setAnswers({ ...answers, entrance_exams, exam_scores });
  };

  const relevantExams = ENTRANCE_EXAMS.filter(
    (exam) => answers.streams.length === 0 || answers.streams.includes(exam.stream)
  );

  const examsNeedingScores = answers.entrance_exams.filter((code) =>
    relevantExams.some((e) => e.value === code)
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const pruned = pruneExamsForStreams(
        answers.streams,
        answers.entrance_exams,
        answers.exam_scores,
      );
      const { data } = await api.post('/recommend', {
        ...answers,
        ...pruned,
        budget_max: answers.budget_max || undefined,
      });
      setResults(data.colleges);
      setTotalMatches(data.total_matches);
    } catch (err) {
      toast.error('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep?.id) {
      case 'course_level': return answers.course_level !== '';
      case 'streams': return answers.streams.length > 0;
      case 'entrance_exams': return true; // optional
      case 'exam_scores': return true; // optional
      case 'preferred_states': return true; // optional
      case 'budget': return true; // optional
      case 'college_type': return true; // optional
      default: return true;
    }
  };

  // Show results
  if (results !== null) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎯 Your Recommended Colleges</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Found {totalMatches} colleges matching your criteria. Showing top {results.length}.
              </p>
            </div>
            <button
              onClick={resetQuiz}
              className="btn-secondary"
            >
              ← Retake Quiz
            </button>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">😔</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No exact matches found</h3>
            <p className="text-muted mb-4">Try widening your criteria - maybe increase budget or add more states</p>
            <button onClick={resetQuiz} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((college, idx) => (
              <div key={college.id} className="relative">
                {idx < 3 && (
                  <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {idx + 1}
                  </div>
                )}
                <CollegeCard college={college} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Step {step + 1} of {STEPS.length}</span>
            <button
              onClick={() => handleSubmit()}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Skip to results →
            </button>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{currentStep.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{currentStep.subtitle}</p>

          {/* Step Content */}
          {currentStep.id === 'course_level' && (
            <div className="space-y-3">
              {COURSE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setAnswers({ ...answers, course_level: level.value })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers.course_level === level.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-400'
                  }`}
                >
                  <span className="text-xl mr-3">{level.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{level.label}</span>
                </button>
              ))}
            </div>
          )}

          {currentStep.id === 'streams' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STREAMS.map((stream) => (
                <button
                  key={stream.value}
                  onClick={() => toggleStream(stream.value)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    answers.streams.includes(stream.value)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-400'
                  }`}
                >
                  <span className="text-xl mr-2">{stream.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{stream.label}</span>
                </button>
              ))}
            </div>
          )}

          {currentStep.id === 'entrance_exams' && (
            <div className="max-h-80 overflow-y-auto space-y-2">
              {relevantExams.map((exam) => (
                <label
                  key={exam.value}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    answers.entrance_exams.includes(exam.value)
                      ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={answers.entrance_exams.includes(exam.value)}
                    onChange={() => toggleEntranceExam(exam.value)}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 w-5 h-5"
                  />
                  <span className="font-medium text-gray-800 dark:text-gray-200">{exam.label}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{exam.stream}</span>
                </label>
              ))}
            </div>
          )}

          {currentStep.id === 'exam_scores' && (
            <div className="space-y-4">
              {examsNeedingScores.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No exams selected. You can skip this step.
                </p>
              ) : (
                examsNeedingScores.map((examCode) => {
                  const exam = ENTRANCE_EXAMS.find((e) => e.value === examCode);
                  const scoreLabel = exam?.scoreType === 'rank' ? 'Rank' : 
                                     exam?.scoreType === 'percentile' ? 'Percentile' : 'Score';
                  return (
                    <div key={examCode} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {exam?.label}
                        </label>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          exam?.scoreType === 'rank' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                          exam?.scoreType === 'percentile' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {scoreLabel}
                        </span>
                      </div>
                      <input
                        type="number"
                        placeholder={exam?.placeholder || 'Enter your score'}
                        value={answers.exam_scores[examCode] || ''}
                        onChange={(e) =>
                          setAnswers({
                            ...answers,
                            exam_scores: {
                              ...answers.exam_scores,
                              [examCode]: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="input-field"
                      />
                    </div>
                  );
                })
              )}
            </div>
          )}

          {currentStep.id === 'preferred_states' && (
            <div className="space-y-4">
              <button
                onClick={() => setAnswers({ ...answers, preferred_states: [] })}
                className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${
                  answers.preferred_states.length === 0
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'border-gray-100 dark:border-gray-700 hover:border-primary-200 text-gray-700 dark:text-gray-300'
                }`}
              >
                🌍 Anywhere in India (No location preference)
              </button>
              <div className="relative">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Or select specific states:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {STATES.map((state) => (
                    <button
                      key={state}
                      onClick={() => toggleArray('preferred_states', state)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        answers.preferred_states.includes(state)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep.id === 'budget' && (
            <div className="space-y-3">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAnswers({ ...answers, budget_max: opt.value || null })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers.budget_max === opt.value || (opt.value === 0 && answers.budget_max === null)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-400'
                  }`}
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100">{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {currentStep.id === 'college_type' && (
            <div className="space-y-3">
              {COLLEGE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleArray('college_type', type.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers.college_type.includes(type.value)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-200 dark:hover:border-primary-400'
                  }`}
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100">{type.label}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">— {type.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="btn-secondary disabled:opacity-40"
            >
              ← Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="btn-primary disabled:opacity-40"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? '🔍 Finding colleges...' : '🎯 Show My Colleges'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

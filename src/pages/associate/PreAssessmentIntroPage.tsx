import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Code2,
  ListChecks,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetaRow, PageHeader } from '../../components/shared/UiPrimitives';

export const PreAssessmentIntroPage: React.FC = () => {
  const { assessments } = useApp();
  const navigate = useNavigate();

  const preAssessment =
    assessments.find((a) => a.type === 'Pre-Assessment') || assessments[0];

  const mcCount = preAssessment.questions.filter((q) => q.type === 'multiple-choice').length;
  const codeCount = preAssessment.questions.filter((q) => q.type === 'coding').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={preAssessment.title}
        description="Diagnostic baseline evaluation that maps your current Python, NumPy, and robotics proficiency to the optimal starting module."
      />

      <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-slate-800 rounded-[10px] p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-[#E2E8F0] dark:border-slate-800">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5 text-[#37852d] dark:text-[#84E179]" />
              <span>Questions</span>
            </div>
            <div className="mt-1 text-xl font-bold text-[#111827] dark:text-slate-100 tabular-nums">
              {preAssessment.questions.length}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#37852d] dark:text-[#84E179]" />
              <span>Est. Duration</span>
            </div>
            <div className="mt-1 text-xl font-bold text-[#111827] dark:text-slate-100 tabular-nums">
              {preAssessment.durationMinutes} min
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#37852d] dark:text-[#84E179]" />
              <span>Format</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-[#111827] dark:text-slate-100">
              {mcCount} MC · {codeCount} Coding
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400" />
              <span>Autosave</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-[#16A34A] dark:text-emerald-400">Enabled</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Assessment Instructions</h2>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Answer multiple-choice items and execute Python coding tasks directly in the browser.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Your progress autosaves locally as you navigate between questions or flag items for review.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>Correct answers are withheld until submission so skill placement remains accurate.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#111827] dark:text-slate-100">Adaptive Mapping Workflow</h2>
            <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal pl-4">
              <li>Complete the diagnostic questions at your own pace within {preAssessment.durationMinutes} minutes.</li>
              <li>NewtonLab evaluates topic mastery across Python, NumPy, Robotics, and ROS.</li>
              <li>You receive a personalized starting module recommendation without repeating mastered topics.</li>
              <li>Proceed directly into interactive coding labs and 3D robotics simulation.</li>
            </ol>
          </div>
        </div>

        <div className="pt-5 border-t border-[#E2E8F0] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <MetaRow items={['Passing benchmark: 70%', `Attempt limit: ${preAssessment.attemptLimit}`]} />
          <button
            type="button"
            onClick={() => navigate(`/associate/assessment/${preAssessment.id}`)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[10px] bg-[#53b947] hover:bg-[#459e3a] text-[#0B1A09] text-sm font-semibold transition-colors whitespace-nowrap"
          >
            <span>Start Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

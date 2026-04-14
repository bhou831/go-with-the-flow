import questionsData from '@/data/questions.json';
import SurveyContainer from '@/components/survey/SurveyContainer';
import type { Question } from '@/lib/types';

export default function SurveyPage() {
  const questions = questionsData as Question[];
  return <SurveyContainer questions={questions} />;
}

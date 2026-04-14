import questionsData from '@/data/questions.json';
import SurveyContainer from '@/components/survey/SurveyContainer';
import { QuestionsSchema } from '@/lib/validation';

export default function SurveyPage() {
  const questions = QuestionsSchema.parse(questionsData);
  return <SurveyContainer questions={questions} />;
}

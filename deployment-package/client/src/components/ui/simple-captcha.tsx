import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';

// Define an interface for the component props
interface SimpleCaptchaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// A list of simple math questions in Arabic
const mathQuestions = [
  { question: "ما هو ناتج جمع: ٢ + ٣؟", answer: "5" },
  { question: "ما هو ناتج جمع: ١ + ٤؟", answer: "5" },
  { question: "ما هو ناتج طرح: ٥ - ٢؟", answer: "3" },
  { question: "كم عدد أيام الأسبوع؟", answer: "7" },
  { question: "كم عدد أشهر السنة؟", answer: "12" },
  { question: "ما هو ناتج ضرب: ٢ × ٣؟", answer: "6" },
  { question: "ما هو ناتج ٩ - ٤؟", answer: "5" },
  { question: "كم عدد الألوان في علم سوريا؟", answer: "3" },
];

/**
 * A simple Arabic CAPTCHA component that asks simple math questions
 */
export const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({
  value,
  onChange,
  error
}) => {
  const [question, setQuestion] = useState('');
  const [expectedAnswer, setExpectedAnswer] = useState('');
  
  // Generate a random question on mount
  useEffect(() => {
    generateQuestion();
  }, []);
  
  // Function to generate a random question
  const generateQuestion = () => {
    const randomIndex = Math.floor(Math.random() * mathQuestions.length);
    const selectedQuestion = mathQuestions[randomIndex];
    setQuestion(selectedQuestion.question);
    setExpectedAnswer(selectedQuestion.answer);
  };
  
  return (
    <div className="mt-4">
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-4">
          <div className="space-y-2">
            <Label>تحقق الأمان</Label>
            <p className="text-sm text-muted-foreground">
              يرجى الإجابة على السؤال التالي للمتابعة:
            </p>
            <div className="font-medium mt-1 mb-2 text-foreground">{question}</div>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="اكتب الإجابة هنا"
              className="bg-background"
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleCaptcha;
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

// Define an interface for the component props
interface ClickCaptchaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// Define the structure for verification options
interface VerificationOption {
  id: string;
  label: string;
  isHuman: boolean;
  hint?: string;
  style?: React.CSSProperties;
}

// More challenging verification options that require human understanding
const verificationOptions: VerificationOption[] = [
  { 
    id: "math1", 
    label: "٤ + ٣ = ٧", 
    isHuman: true,
    hint: "اختر المعادلة الصحيحة"
  },
  { 
    id: "wrong_math1", 
    label: "٢ × ٣ = ٧", 
    isHuman: false,
    hint: "اختر المعادلة الصحيحة" 
  },
  { 
    id: "color1", 
    label: "اللون الأحمر", 
    style: { color: "red", borderColor: "red" },
    isHuman: true,
    hint: "اختر النص ذو اللون المناسب" 
  },
  { 
    id: "wrong_color1", 
    label: "اللون الأزرق", 
    style: { color: "green", borderColor: "green" },
    isHuman: false,
    hint: "اختر النص ذو اللون المناسب"
  },
  { 
    id: "emoji1", 
    label: "😊 ابتسامة", 
    isHuman: true,
    hint: "اختر الوصف الصحيح للرمز"
  },
  { 
    id: "wrong_emoji1", 
    label: "😊 حزين", 
    isHuman: false,
    hint: "اختر الوصف الصحيح للرمز"
  },
  { 
    id: "proverb1", 
    label: "العقل السليم في الجسم السليم", 
    isHuman: true,
    hint: "اختر المثل الصحيح"
  },
  { 
    id: "wrong_proverb1", 
    label: "العقل السليم في المال الوفير", 
    isHuman: false,
    hint: "اختر المثل الصحيح"
  }
];

/**
 * A more challenging Arabic CAPTCHA component with click verification
 * Uses visual and logical challenges that are harder for bots to solve
 */
export const ClickCaptcha: React.FC<ClickCaptchaProps> = ({
  value,
  onChange,
  error
}) => {
  const [options, setOptions] = useState<VerificationOption[]>([]);
  const [verified, setVerified] = useState(false);
  const [hint, setHint] = useState<string>("");
  
  // Generate random options on mount
  useEffect(() => {
    generateOptions();
  }, []);
  
  // Function to generate random challenge with paired options
  const generateOptions = () => {
    // Group options by their hint type to create pairs of correct/incorrect options
    const optionGroups: {[key: string]: VerificationOption[]} = {};
    verificationOptions.forEach(option => {
      if (!optionGroups[option.hint!]) {
        optionGroups[option.hint!] = [];
      }
      optionGroups[option.hint!].push(option);
    });
    
    // Select a random challenge type (hint)
    const challengeTypes = Object.keys(optionGroups);
    const selectedHint = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    setHint(selectedHint);
    
    // Get the options for this challenge type
    const optionsForHint = optionGroups[selectedHint];
    
    // Add at least one correct option and one or two incorrect options
    let selected: VerificationOption[] = [];
    const correctOptions = optionsForHint.filter(o => o.isHuman);
    const incorrectOptions = optionsForHint.filter(o => !o.isHuman);
    
    // Add a correct option
    selected.push(correctOptions[Math.floor(Math.random() * correctOptions.length)]);
    
    // Add an incorrect option
    selected.push(incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)]);
    
    // Optionally add a second incorrect option (33% chance)
    if (Math.random() > 0.33) {
      const remainingIncorrect = incorrectOptions.filter(o => 
        !selected.some(sel => sel.id === o.id)
      );
      if (remainingIncorrect.length > 0) {
        selected.push(remainingIncorrect[Math.floor(Math.random() * remainingIncorrect.length)]);
      }
    }
    
    // Shuffle for final order
    setOptions(selected.sort(() => 0.5 - Math.random()));
  };
  
  // Handle option selection
  const handleOptionClick = (option: VerificationOption) => {
    if (option.isHuman) {
      setVerified(true);
      onChange("verified");
    } else {
      setVerified(false);
      onChange("");
      // Regenerate options if they choose wrong
      generateOptions();
    }
  };
  
  return (
    <div className="mt-4">
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-4">
          <div className="space-y-2">
            <Label>تحقق الأمان</Label>
            <p className="text-sm text-muted-foreground">
              {hint}:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {options.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant="outline"
                  onClick={() => handleOptionClick(option)}
                  className={`h-14 relative ${verified && option.isHuman ? 'bg-primary/10 border-primary' : ''}`}
                  style={option.style}
                  disabled={verified}
                >
                  {option.label}
                  {verified && option.isHuman && (
                    <CheckCircle2 className="h-5 w-5 absolute top-2 right-2 text-primary" />
                  )}
                </Button>
              ))}
            </div>
            
            {verified && (
              <p className="text-sm text-green-600 font-medium mt-2">
                تم التحقق بنجاح!
              </p>
            )}
            
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClickCaptcha;
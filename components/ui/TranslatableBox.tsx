'use client';

import React, { useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { translateText, translateItems } from '@/lib/translation-service';

export interface TranslatableBoxProps {
  text?: string;
  items?: string[];
  lang?: 'id' | 'en';
  textClassName?: string;
  listClassName?: string;
  itemClassName?: string;
  className?: string;
  buttonClassName?: string;
}

export function TranslatableBox({
  text,
  items,
  lang = 'id',
  textClassName = 'text-xs sm:text-sm text-foreground/85 leading-relaxed',
  listClassName = 'space-y-1.5 text-foreground/80 list-disc list-inside',
  itemClassName = 'leading-relaxed',
  className = '',
  buttonClassName = '',
}: TranslatableBoxProps) {
  const [isTranslated, setIsTranslated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translatedItems, setTranslatedItems] = useState<string[] | null>(null);

  const hasContent = Boolean((text && text.trim()) || (items && items.length > 0));
  if (!hasContent) return null;

  const handleToggle = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    if (translatedText || translatedItems) {
      setIsTranslated(true);
      return;
    }

    try {
      setIsLoading(true);
      if (text) {
        const res = await translateText(text, 'en', 'id');
        setTranslatedText(res);
      }
      if (items && items.length > 0) {
        const resItems = await translateItems(items, 'en', 'id');
        setTranslatedItems(resItems);
      }
      setIsTranslated(true);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const displayText = isTranslated && translatedText ? translatedText : text;
  const displayItems = isTranslated && translatedItems ? translatedItems : items;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Content Rendering */}
      {displayItems && displayItems.length > 0 ? (
        <ul className={listClassName}>
          {displayItems.map((item, idx) => (
            <li key={idx} className={itemClassName}>
              {item}
            </li>
          ))}
        </ul>
      ) : displayText ? (
        <div className={textClassName}>{displayText}</div>
      ) : null}

      {/* Action: On-demand Translate Button (Only visible for non-ID languages like English) */}
      {lang !== 'id' && (
        <div className="pt-1 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-brand-blue hover:text-brand-blue/80 hover:bg-brand-blue/5 transition-all cursor-pointer border border-brand-blue/20 active:scale-95 disabled:opacity-60 disabled:cursor-wait ${buttonClassName}`}
            title={isTranslated ? 'Show original (Bahasa Indonesia)' : 'Translate to English'}
          >
            {isLoading ? (
              <>
                <Loader2 size={12} className="animate-spin text-brand-blue" />
                <span>Translating...</span>
              </>
            ) : (
              <>
                <Languages size={13} className="text-brand-blue shrink-0" />
                <span>
                  {isTranslated
                    ? 'Show original (Bahasa Indonesia)'
                    : 'Translate to English'}
                </span>
              </>
            )}
          </button>

          {isTranslated && (
            <span className="text-[10px] text-foreground-muted italic">
              • Translated automatically
            </span>
          )}
        </div>
      )}
    </div>
  );
}

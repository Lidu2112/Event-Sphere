
import { Translator } from '@miracleufo/react-g-translator';

export default function AutoTranslate({ language, children }) {
  return (
    <Translator
      from="en"
      to={language}
      shouldFallback
    >
      {children}
    </Translator>
  );
}

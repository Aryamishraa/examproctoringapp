// src/components/DocumentHead.tsx
import { Helmet } from 'react-helmet-async';

export function DocumentHead() {
  return (
    <Helmet>
      <title>Safe Examiner App - Complete Examination System</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    </Helmet>
  );
}
"use client";

import React, { useState } from "react";
import { ManualForm, ManualFormData } from "./ManualForm";
import { ReviewScreen } from "./ReviewScreen";
import { IntakeProfile } from "@/lib/types";

interface IntakePanelProps {
  panelLabel?: string;
  onProfileConfirmed: (data: ManualFormData) => void;
  onDualProfileDetected?: (prof1: IntakeProfile, prof2: IntakeProfile) => void;
  initialProfile?: IntakeProfile | null;
}

export const IntakePanel: React.FC<IntakePanelProps> = ({
  panelLabel = "Person Details",
  onProfileConfirmed,
  initialProfile = null
}) => {
  const [pendingReviewProfile, setPendingReviewProfile] = useState<IntakeProfile | null>(initialProfile);

  const testId = `intake-panel-${panelLabel.toLowerCase().replace(/\s+/g, '-')}`;

  // If a profile was passed as initialProfile or freshly extracted, show ReviewScreen
  if (pendingReviewProfile) {
    return (
      <div data-testid={testId}>
        <ReviewScreen
          title={`Review ${panelLabel}`}
          initialProfile={pendingReviewProfile}
          onConfirm={(confirmed) => {
            setPendingReviewProfile(null);
            onProfileConfirmed(confirmed);
          }}
          onCancel={() => setPendingReviewProfile(null)}
        />
      </div>
    );
  }

  return (
    <div data-testid={testId} className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-md p-5 sm:p-6 transition-all">
      {/* Panel Title */}
      <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 mb-3.5 flex items-center justify-between">
        <span className="font-serif-vedic">{panelLabel}</span>
      </h3>

      {/* Manual birth-details form */}
      <div>
        <ManualForm
          onSubmit={(formData) => {
            // Convert manual form to ReviewScreen format for consistency
            const manualProfile: IntakeProfile = {
              full_name: { value: formData.name, confidence: 1.0, source_text: formData.name },
              gender: { value: formData.gender, confidence: 1.0, source_text: formData.gender },
              date_of_birth: { value: formData.birth_date, confidence: 1.0, source_text: formData.birth_date },
              time_of_birth: {
                value: formData.is_time_unknown ? null : formData.birth_time,
                confidence: formData.is_time_unknown ? 0.0 : 1.0,
                source_text: formData.birth_time
              },
              place_of_birth: { value: formData.place_of_birth, confidence: 1.0, source_text: formData.place_of_birth },
              latitude: formData.latitude,
              longitude: formData.longitude,
              iana_timezone: formData.iana_timezone,
              stated_rashi: { value: formData.stated_rashi || null, confidence: 1.0, source_text: null },
              stated_nakshatra: { value: formData.stated_nakshatra || null, confidence: 1.0, source_text: null },
              stated_gothra: { value: formData.stated_gothra || null, confidence: 1.0, source_text: null },
              warnings: []
            };
            setPendingReviewProfile(manualProfile);
          }}
        />
      </div>
    </div>
  );
};

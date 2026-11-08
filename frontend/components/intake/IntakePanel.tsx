"use client";

import React, { useState } from "react";
import { ManualForm, ManualFormData } from "./ManualForm";
import { PasteText } from "./PasteText";
import { FileUpload } from "./FileUpload";
import { ReviewScreen } from "./ReviewScreen";
import { ExtractionResponse, IntakeProfile } from "@/lib/types";
import { Upload, Clipboard, Edit3 } from "lucide-react";

interface IntakePanelProps {
  panelLabel?: string;
  onProfileConfirmed: (data: ManualFormData) => void;
  onDualProfileDetected?: (prof1: IntakeProfile, prof2: IntakeProfile) => void;
  initialProfile?: IntakeProfile | null;
}

export const IntakePanel: React.FC<IntakePanelProps> = ({
  panelLabel = "Person Details",
  onProfileConfirmed,
  onDualProfileDetected,
  initialProfile = null
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "paste" | "manual">("manual");
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

  const handleExtraction = (res: ExtractionResponse) => {
    if (res.is_dual_profile && res.secondary_profile && onDualProfileDetected) {
      onDualProfileDetected(res.primary_profile, res.secondary_profile);
    } else {
      setPendingReviewProfile(res.primary_profile);
    }
  };

  return (
    <div data-testid={testId} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-md p-5">
      {/* Panel Title */}
      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center justify-between">
        <span>{panelLabel}</span>
        <span className="text-xs font-normal text-stone-500">Choose any of 3 input methods</span>
      </h3>

      {/* 3 Intake Method Tabs */}
      <div className="grid grid-cols-3 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl mb-5 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "upload"
              ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("paste")}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "paste"
              ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
          }`}
        >
          <Clipboard className="w-3.5 h-3.5" />
          <span>Paste Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "manual"
              ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Manual Form</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "upload" && (
          <FileUpload onExtracted={handleExtraction} />
        )}
        {activeTab === "paste" && (
          <PasteText onExtracted={handleExtraction} />
        )}
        {activeTab === "manual" && (
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
        )}
      </div>
    </div>
  );
};

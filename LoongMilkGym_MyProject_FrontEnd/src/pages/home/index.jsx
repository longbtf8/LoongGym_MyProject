import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Sub-components
import HeroSection from "./components/HeroSection";
import WeeklyStatsPreview from "./components/WeeklyStatsPreview";
import PopularExercises from "./components/PopularExercises";
import MuscleGroupGoals from "./components/MuscleGroupGoals";
import RecommendedPrograms from "./components/RecommendedPrograms";
import HIITBanner from "./components/HIITBanner";
import ProgressMedals from "./components/ProgressMedals";
import TestimonialQuote from "./components/TestimonialQuote";

function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    // Nếu phát hiện token xác thực trên URL trang chủ, tự động chuyển sang trang xác thực chuyên dụng
    if (token) {
      navigate(`/verify-email?token=${token}`, { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="flex flex-col gap-6 sm:gap-10 pb-12 overflow-hidden">
      
      {/* Section 1: Hero Banner */}
      <HeroSection />

      {/* Section 2: Quick stats overview with charts */}
      <WeeklyStatsPreview />

      {/* Section 3: Popular Exercises */}
      <PopularExercises />

      {/* Section 4: Target Muscle Groups */}
      <MuscleGroupGoals />

      {/* Section 5: Recommended Programs */}
      <RecommendedPrograms />

      {/* Section 6: HIIT Promo Banner */}
      <HIITBanner />

      {/* Section 7: Weekly Progress & Achievements */}
      <ProgressMedals />

      {/* Section 8: Motivational Quote Banner */}
      <TestimonialQuote />

    </div>
  );
}

export default Home;

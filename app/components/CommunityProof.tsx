"use client";

import { useEffect, useState } from "react";
import { loadCommunityBand, type CommunityBand } from "../lib/cloud-progress";
import { isCloudProgressEnabled } from "../lib/appwrite/config";
import { useAuth } from "./AuthProvider";
import { useI18n } from "./I18n";

export function CommunityProof() {
  const { pick } = useI18n();
  const { status, openAuth } = useAuth();
  const [band, setBand] = useState<CommunityBand>("founding");
  const cloudEnabled = isCloudProgressEnabled();

  useEffect(() => {
    if (!cloudEnabled) return;
    let active = true;
    void loadCommunityBand()
      .then((value) => { if (active) setBand(value); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [cloudEnabled]);

  if (!cloudEnabled) return null;

  const copy = communityCopy(band, pick, status === "signed_in");
  if (status === "signed_out") {
    return (
      <button className="community-proof community-proof-action" type="button" onClick={openAuth}>
        <span aria-hidden="true">✦</span> {copy} <b aria-hidden="true">→</b>
      </button>
    );
  }

  return <p className="community-proof"><span aria-hidden="true">✦</span> {copy}</p>;
}

function communityCopy(
  band: CommunityBand,
  pick: (zh: string, en: string) => string,
  joined: boolean,
) {
  if (joined) {
    switch (band) {
      case "hundred_thousand": return pick("与 100,000+ 学员一起学习", "Learning with 100,000+ learners");
      case "ten_thousand": return pick("与 10,000+ 学员一起学习", "Learning with 10,000+ learners");
      case "thousand": return pick("与 1,000+ 学员一起学习", "Learning with 1,000+ learners");
      case "hundred": return pick("与 100+ 学员一起学习", "Learning with 100+ learners");
      case "early": return pick("你已加入正在成长的早期学员社区", "You’re part of our growing early community");
      default: return pick("你是一名创始学员", "You’re a founding learner");
    }
  }

  switch (band) {
    case "hundred_thousand": return pick("加入 100,000+ 学员", "Join 100,000+ learners");
    case "ten_thousand": return pick("加入 10,000+ 学员", "Join 10,000+ learners");
    case "thousand": return pick("加入 1,000+ 学员", "Join 1,000+ learners");
    case "hundred": return pick("加入 100+ 学员", "Join 100+ learners");
    case "early": return pick("加入正在成长的早期学员社区", "Join a growing group of early learners");
    default: return pick("成为创始学员", "Become a founding learner");
  }
}

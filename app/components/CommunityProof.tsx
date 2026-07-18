"use client";

import { useEffect, useState } from "react";
import { loadCommunityBand, type CommunityBand } from "../lib/cloud-progress";
import { getBrowserSupabaseClient } from "../lib/supabase/client";
import { useI18n } from "./I18n";

export function CommunityProof() {
  const { pick } = useI18n();
  const [band, setBand] = useState<CommunityBand>("founding");

  useEffect(() => {
    const client = getBrowserSupabaseClient();
    if (!client) return;
    let active = true;
    void loadCommunityBand(client)
      .then((value) => { if (active) setBand(value); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return <p className="community-proof"><span aria-hidden="true">✦</span> {communityCopy(band, pick)}</p>;
}

function communityCopy(
  band: CommunityBand,
  pick: (zh: string, en: string) => string,
) {
  switch (band) {
    case "hundred_thousand": return pick("加入 100,000+ 学员", "Join 100,000+ learners");
    case "ten_thousand": return pick("加入 10,000+ 学员", "Join 10,000+ learners");
    case "thousand": return pick("加入 1,000+ 学员", "Join 1,000+ learners");
    case "hundred": return pick("加入 100+ 学员", "Join 100+ learners");
    case "early": return pick("加入正在成长的早期学员社区", "Join a growing group of early learners");
    default: return pick("加入创始学员行列", "Join the founding learners");
  }
}

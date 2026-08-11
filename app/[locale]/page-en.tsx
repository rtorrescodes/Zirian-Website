"use client";

import React from "react";
import { HomeHeader } from "@/components/home/home-header";
import { Hero } from "@/components/home/hero";
import { StatsBar } from "@/components/home/stats-bar";
import { BrandsMarquee } from "@/components/home/brands-marquee";
import { EvChargers } from "@/components/home/ev-chargers";
import { SmartHome } from "@/components/home/smart-home";
import { SecurityAlddea } from "@/components/home/security-alddea";
import { EstimatorForm } from "@/components/home/estimator-form";
import { ContactForm } from "@/components/home/contact-form";
import { SupportTicket } from "@/components/home/support-ticket";
import { HomeBlog } from "@/components/home/home-blog";
import { HomeFooter } from "@/components/home/home-footer";

export default function LandingPageEN() {
  return (
    <div className="bg-brand-dark text-gray-200 font-sans antialiased overflow-x-hidden w-full">
      <HomeHeader locale="en" />
      <Hero locale="en" />
      <StatsBar locale="en" />
      <BrandsMarquee locale="en" />
      <EvChargers locale="en" />
      <SmartHome locale="en" />
      <SecurityAlddea locale="en" />
      <EstimatorForm locale="en" />
      <ContactForm locale="en" />
      <SupportTicket locale="en" />
      <HomeBlog locale="en" />
      <HomeFooter locale="en" />
    </div>
  );
}

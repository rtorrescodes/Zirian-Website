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

export default function LandingPageES() {
  return (
    <div className="bg-brand-dark text-gray-200 font-sans antialiased overflow-x-hidden w-full">
      <HomeHeader locale="es" />
      <Hero locale="es" />
      <StatsBar locale="es" />
      <BrandsMarquee locale="es" />
      <EvChargers locale="es" />
      <SmartHome locale="es" />
      <SecurityAlddea locale="es" />
      <EstimatorForm locale="es" />
      <ContactForm locale="es" />
      <SupportTicket locale="es" />
      <HomeBlog locale="es" />
      <HomeFooter locale="es" />
    </div>
  );
}

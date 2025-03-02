"use client";

import { remToPx } from "@/lib/remToPx";
import clsx from "clsx";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

import { Button } from "./Button";
import { useIsInsideMobileNavigation } from "./MobileNavigation";
import { useSectionStore } from "./SectionProvider";
import { Tag } from "./Tag";

interface NavGroup {
  title: string;
  links: Array<{
    title: string;
    href: string;
  }>;
}

function useInitialValue<T>(value: T, condition = true) {
  let initialValue = useRef(value).current;
  return condition ? initialValue : value;
}

function TopLevelNavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li className="md:hidden">
      <Link
        href={href}
        className="block py-1 text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        {children}
      </Link>
    </li>
  );
}

function NavLink({
  href,
  children,
  tag,
  active = false,
  isAnchorLink = false,
}: {
  href: string;
  children: React.ReactNode;
  tag?: string;
  active?: boolean;
  isAnchorLink?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "flex justify-between gap-2 py-1 pr-3 text-sm transition",
        isAnchorLink ? "pl-7" : "pl-4",
        active
          ? "text-slate-900 dark:text-white"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      )}>
      <span className="truncate">{children}</span>
      {tag && (
        <Tag variant="small" color="slate">
          {tag}
        </Tag>
      )}
    </Link>
  );
}

function VisibleSectionHighlight({ group, pathname }: { group: NavGroup; pathname: string }) {
  let [sections, visibleSections] = useInitialValue(
    [useSectionStore((s) => s.sections), useSectionStore((s) => s.visibleSections)],
    useIsInsideMobileNavigation()
  );

  let isPresent = useIsPresent();
  let firstVisibleSectionIndex = Math.max(
    0,
    [{ id: "_top" }, ...sections].findIndex((section) => section.id === visibleSections[0])
  );
  let itemHeight = remToPx(2);
  let height = isPresent ? Math.max(1, visibleSections.length) * itemHeight : itemHeight;
  let top =
    group.links.findIndex((link) => link.href === pathname) * itemHeight +
    firstVisibleSectionIndex * itemHeight;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      className="bg-slate-800/2.5 dark:bg-white/2.5 absolute inset-x-0 top-0 will-change-transform"
      style={{ borderRadius: 8, height, top }}
    />
  );
}

function ActivePageMarker({ group, pathname }: { group: NavGroup; pathname: string }) {
  let itemHeight = remToPx(2);
  let offset = remToPx(0.25);
  let activePageIndex = group.links.findIndex((link) => link.href === pathname);
  let top = offset + activePageIndex * itemHeight;

  return (
    <motion.div
      layout
      className="absolute left-2 h-6 w-px bg-emerald-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  );
}
function NavigationGroup({ group, className }: { group: NavGroup; className?: string }) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation();
  let [pathname, sections] = useInitialValue(
    [usePathname(), useSectionStore((s) => s.sections)],
    isInsideMobileNavigation
  );

  let isActiveGroup = group.links.findIndex((link) => link.href === pathname) !== -1;

  return (
    <li className={clsx("relative mt-6", className)}>
      <motion.h2 layout="position" className="text-xs font-semibold text-slate-900 dark:text-white">
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        <AnimatePresence initial={!isInsideMobileNavigation}>
          {isActiveGroup && <VisibleSectionHighlight group={group} pathname={pathname || "/docs"} />}
        </AnimatePresence>
        <motion.div layout className="absolute inset-y-0 left-2 w-px bg-slate-900/10 dark:bg-white/5" />
        <AnimatePresence initial={false}>
          {isActiveGroup && <ActivePageMarker group={group} pathname={pathname || "/docs"} />}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => (
            <motion.li key={link.href} layout="position" className="relative">
              <NavLink href={link.href} active={link.href === pathname}>
                {link.title}
              </NavLink>
              <AnimatePresence mode="popLayout" initial={false}>
                {link.href === pathname && sections.length > 0 && (
                  <motion.ul
                    role="list"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: { delay: 0.1 },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0.15 },
                    }}>
                    {sections.map((section) => (
                      <li key={section.id}>
                        <NavLink href={`${link.href}#${section.id}`} tag={section.tag} isAnchorLink>
                          {section.title}
                        </NavLink>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export const navigation: Array<NavGroup> = [
  {
    title: "Introduction",
    links: [
      { title: "What is Formbricks?", href: "/docs/introduction/what-is-formbricks" },
      { title: "Why is it better?", href: "/docs/introduction/why-is-it-better" },
      { title: "How does it work?", href: "/docs/introduction/how-it-works" },
    ],
  },
  {
    title: "In-App Surveys",
    links: [
      { title: "Quickstart", href: "/docs/getting-started/quickstart-in-app-survey" },
      { title: "Framework Guides", href: "/docs/getting-started/framework-guides" },
      { title: "Troubleshooting", href: "/docs/getting-started/troubleshooting" },
      { title: "Identify Users", href: "/docs/in-app-surveys/user-identification" },
      { title: "Actions", href: "/docs/in-app-surveys/actions" },
      { title: "Attributes", href: "/docs/in-app-surveys/attributes" },
    ],
  },
  {
    title: "Link Surveys",
    links: [
      { title: "Quickstart", href: "/docs/link-surveys/quickstart" },
      { title: "Data Prefilling", href: "/docs/link-surveys/data-prefilling" },
      { title: "Identify Users", href: "/docs/link-surveys/user-identification" },
      { title: "Single Use Links", href: "/docs/link-surveys/single-use-links" },
      { title: "Source Tracking", href: "/docs/link-surveys/source-tracking" },
    ],
  },
  {
    title: "Best Practices",
    links: [
      { title: "Learn from Churn", href: "/docs/best-practices/cancel-subscription" },
      { title: "Interview Prompt", href: "/docs/best-practices/interview-prompt" },
      { title: "Product-Market Fit", href: "/docs/best-practices/pmf-survey" },
      { title: "Trial Conversion", href: "/docs/best-practices/improve-trial-cr" },
      { title: "Feature Chaser", href: "/docs/best-practices/feature-chaser" },
      { title: "Feedback Box", href: "/docs/best-practices/feedback-box" },
      { title: "Docs Feedback", href: "/docs/best-practices/docs-feedback" },
      { title: "Improve Email Content", href: "/docs/best-practices/improve-email-content" },
    ],
  },
  {
    title: "Integrations",
    links: [
      { title: "Airtable", href: "/docs/integrations/airtable" },
      { title: "Google Sheets", href: "/docs/integrations/google-sheets" },
      { title: "Notion", href: "/docs/integrations/notion" },
      { title: "Make.com", href: "/docs/integrations/make" },
      { title: "n8n", href: "/docs/integrations/n8n" },
      { title: "Wordpress", href: "/docs/integrations/wordpress" },
      { title: "Zapier", href: "/docs/integrations/zapier" },
    ],
  },
  {
    title: "Self-hosting",
    links: [
      { title: "Introduction", href: "/docs/self-hosting/deployment" },
      { title: "One-Click Setup", href: "/docs/self-hosting/production" },
      { title: "Advanced Setup", href: "/docs/self-hosting/docker" },
      { title: "Configure", href: "/docs/self-hosting/external-auth-providers" },
      { title: "Migration Guide", href: "/docs/self-hosting/migration-guide" },
      { title: "License", href: "/docs/self-hosting/license" },
      { title: "Enterprise License", href: "/docs/self-hosting/enterprise" },
    ],
  },
  {
    title: "Contributing",
    links: [
      { title: "Introduction", href: "/docs/contributing/introduction" },
      { title: "Demo App", href: "/docs/contributing/demo" },
      { title: "Setup Dev Environment", href: "/docs/contributing/setup" },
      { title: "How we code at Formbricks", href: "/docs/contributing/how-we-code" },
      { title: "How to create a service", href: "/docs/contributing/creating-a-service" },
      { title: "Troubleshooting", href: "/docs/contributing/troubleshooting" },
      { title: "FAQ", href: "/docs/faq" },
    ],
  },
  {
    title: "Client API",
    links: [
      { title: "Overview", href: "/docs/api/client/overview" },
      { title: "Actions", href: "/docs/api/client/actions" },
      { title: "Displays", href: "/docs/api/client/displays" },
      { title: "People", href: "/docs/api/client/people" },
      { title: "Responses", href: "/docs/api/client/responses" },
    ],
  },
  {
    title: "Management API",
    links: [
      { title: "API Key Setup", href: "/docs/api/management/api-key-setup" },
      { title: "Action Classes", href: "/docs/api/management/action-classes" },
      { title: "Attribute Classes", href: "/docs/api/management/attribute-classes" },
      { title: "Me", href: "/docs/api/management/me" },
      { title: "People", href: "/docs/api/management/people" },
      { title: "Responses", href: "/docs/api/management/responses" },
      { title: "Surveys", href: "/docs/api/management/surveys" },
      { title: "Webhooks", href: "/docs/api/management/webhooks" },
    ],
  },
];

export function Navigation(props: React.ComponentPropsWithoutRef<"nav">) {
  return (
    <nav {...props}>
      <ul role="list">
        <TopLevelNavItem href="/docs/introduction/what-is-formbricks">Documentation</TopLevelNavItem>
        <TopLevelNavItem href="https://github.com/formbricks/formbricks">Star us on GitHub</TopLevelNavItem>
        <TopLevelNavItem href="https://formbricks.com/discord">Join our Discord</TopLevelNavItem>
        {navigation.map((group, groupIndex) => (
          <NavigationGroup key={group.title} group={group} className={groupIndex === 0 ? "md:mt-0" : ""} />
        ))}
        <li className="sticky bottom-0 z-10 mt-6 min-[416px]:hidden">
          <Button
            href="https://app.formbricks.com/auth/signup"
            target="_blank"
            variant="filled"
            className="w-full">
            Get Started
          </Button>
        </li>
      </ul>
    </nav>
  );
}

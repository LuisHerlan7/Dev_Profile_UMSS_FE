import { Link } from 'react-router-dom';
import { Navbar } from '@shared/components/layout/Navbar';
import { Button } from '@shared/components/ui/Button';
import { FadeInSection } from './home/components/FadeInSection';
import { HeroMock } from './home/components/HeroMock';
import { BenefitCard } from './home/components/BenefitCard';
import { StepItem } from './home/components/StepItem';

function IconStack() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12 12 16.5 20.5 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 16.5 12 21l8.5-4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3 12h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 3c2.7 2.3 4.5 5.5 4.5 9S14.7 18.7 12 21c-2.7-2.3-4.5-5.5-4.5-9S9.3 5.3 12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGitHub() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9 19c-4 1.5-4-2.5-5.5-3m11 5v-3.2c0-.9.3-1.6.9-2-3 .3-6.1-1.5-6.1-6.7 0-1.5.5-2.8 1.4-3.8-.1-.4-.6-1.9.1-3.9 0 0 1.1-.3 3.8 1.4a12.8 12.8 0 0 1 6.8 0c2.7-1.7 3.8-1.4 3.8-1.4.7 2 .2 3.5.1 3.9.9 1 1.4 2.3 1.4 3.8 0 5.2-3.1 7-6.1 6.7.6.4.9 1.2.9 2V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomePage() {
  return (
    <div className="min-h-dvh bg-[#F9FAFB]">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-24 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-[#6C63FF]/15 blur-3xl" />
            <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-[#6C63FF]/10 blur-3xl" />
          </div>

          <div className="container-page py-16 sm:py-20 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <FadeInSection>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-slate-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#6C63FF]" />
                  EXCLUSIVE FOR UMSS COMMUNITY
                </div>

                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Create your digital portfolio of{' '}
                  <span className="text-[#6C63FF]">software projects</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  The ultimate platform for UMSS developers to automate their portfolio and
                  stand out in the global market.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link to="/register">
                    <Button className="w-full sm:w-auto">Get Started</Button>
                  </Link>
                  <Link to="/explore">
                    <Button variant="secondary" className="w-full sm:w-auto">
                      View Directory
                    </Button>
                  </Link>
                </div>

                <p className="mt-4 text-sm text-slate-500">
                  Join more than <span className="font-semibold text-slate-700">500</span>{' '}
                  active students
                </p>
              </FadeInSection>

              <FadeInSection className="lg:pl-4">
                <HeroMock />
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="container-page py-16 sm:py-20">
          <FadeInSection>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Why choose Dev Profile UMSS?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Designed specifically for the technological community of San Simón, providing
                professional-level tools.
              </p>
            </div>
          </FadeInSection>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FadeInSection>
              <BenefitCard
                title="Centralization"
                description="All your projects, certificates and skills in one place."
                icon={<IconStack />}
              />
            </FadeInSection>
            <FadeInSection>
              <BenefitCard
                title="Visibility"
                description="Connect with recruiters and companies locally and internationally."
                icon={<IconGlobe />}
              />
            </FadeInSection>
            <FadeInSection>
              <BenefitCard
                title="GitHub Integration"
                description="Automatically sync your repositories and keep your profile updated."
                icon={<IconGitHub />}
              />
            </FadeInSection>
          </div>
        </section>

        {/* Steps */}
        <section id="how-it-works" className="border-t border-slate-200/70 bg-white">
          <div className="container-page py-16 sm:py-20">
            <FadeInSection>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Your career in three steps
                </h2>
              </div>
            </FadeInSection>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <FadeInSection>
                <StepItem
                  number={1}
                  title="Institutional Registration"
                  description="Validate your identity with your UMSS email."
                />
              </FadeInSection>
              <FadeInSection>
                <StepItem
                  number={2}
                  title="GitHub Sync"
                  description="Connect your account to automatically import projects."
                />
              </FadeInSection>
              <FadeInSection>
                <StepItem
                  number={3}
                  title="Share Your Profile"
                  description="Customize your portfolio and share it with companies."
                />
              </FadeInSection>
            </div>

            <FadeInSection className="mt-12">
              <div className="rounded-2xl border border-slate-200 bg-[#F9FAFB] p-6 shadow-sm sm:p-8">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                      Ready to build your portfolio?
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Start in minutes and keep everything synced automatically.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Link to="/register" className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto">Register</Button>
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto">
                      <Button variant="secondary" className="w-full sm:w-auto">
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        <footer className="border-t border-slate-200/70 bg-white">
          <div className="container-page py-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Dev Profile UMSS</span> · Built
                for the UMSS community
              </div>
              <div className="text-sm text-slate-500">
                © {new Date().getFullYear()} Dev Profile UMSS
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}


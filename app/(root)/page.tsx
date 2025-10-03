import { SignInButton } from '@clerk/nextjs'
import { features } from '../constants'

const RootPage = () => {
  return (
    <div className="px-4 md:px-7 xl:px-14">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-20 max-w-3xl mx-auto min-h-screen">
        <h2 className="text-sm font-medium text-[color:var(--accent)] uppercase tracking-wide">
          Small hero header text
        </h2>
        <h1 className="text-4xl md:text-6xl font-bold mt-4 text-[color:var(--text)]">
          Large hero header Text
        </h1>
        <p className="mt-4 text-lg text-[color:var(--muted)]">
          Hero text that introduces your app in a clean, professional way.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex gap-4">
          <SignInButton mode="redirect">
            <button className="px-6 h-11 flex items-center rounded-lg text-sm font-medium">
              Get Started
            </button>
          </SignInButton>

          <a
            href="#features"
            className="px-6 h-11 rounded-lg text-sm flex items-center font-medium border border-[color:var(--accent)] text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-white transition"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 max-w-6xl w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-center">
          {features.map((feature, i) => {
            const FeatureIcon = feature.icon
            return (
              <div
                key={i}
                className="card flex flex-col items-center p-6 rounded-xl bg-[color:var(--bg-secondary)] hover:shadow-md transition"
              >
                <FeatureIcon className="mb-4 w-8 h-8 text-[color:var(--accent)]" />
                <h3 className="text-lg font-semibold text-[color:var(--text)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RootPage

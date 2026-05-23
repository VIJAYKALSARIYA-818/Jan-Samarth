import { Profile, Scheme } from "./types"

export function getEligibleSchemes(profile: Profile, schemes: Scheme[]): Scheme[] {
  return schemes.filter((scheme) => isEligible(profile, scheme))
}

export function isEligible(profile: Profile, scheme: Scheme): boolean {
  // Check age eligibility
  if (scheme.min_age && profile.age && profile.age < scheme.min_age) {
    return false
  }
  if (scheme.max_age && profile.age && profile.age > scheme.max_age) {
    return false
  }

  // Check income eligibility
  if (scheme.max_income && profile.annual_income && profile.annual_income > scheme.max_income) {
    return false
  }
  if (scheme.min_income && profile.annual_income && profile.annual_income < scheme.min_income) {
    return false
  }

  // Check category eligibility
  if (scheme.applicable_categories && scheme.applicable_categories.length > 0) {
    if (profile.category && !scheme.applicable_categories.includes(profile.category)) {
      return false
    }
  }

  // Check state eligibility (empty means all states)
  if (scheme.applicable_states && scheme.applicable_states.length > 0) {
    if (profile.state && !scheme.applicable_states.includes(profile.state)) {
      return false
    }
  }

  // Check target audience
  if (scheme.target_audience && scheme.target_audience.length > 0) {
    if (!scheme.target_audience.includes(profile.profile_type)) {
      // Also check for 'general' which should match everyone
      if (!scheme.target_audience.includes("general")) {
        return false
      }
    }
  }

  return true
}

export function getEligibilityScore(profile: Profile, scheme: Scheme): number {
  let score = 0
  const maxScore = 100

  // Base eligibility (must pass basic checks)
  if (!isEligible(profile, scheme)) {
    return 0
  }

  // Profile type match (30 points)
  if (scheme.target_audience?.includes(profile.profile_type)) {
    score += 30
  } else if (scheme.target_audience?.includes("general")) {
    score += 15
  }

  // Category match (20 points)
  if (scheme.applicable_categories?.includes(profile.category || "")) {
    score += 20
  }

  // Income bracket match (20 points)
  if (scheme.max_income && profile.annual_income) {
    // Higher score for incomes well under the limit
    const incomeRatio = profile.annual_income / scheme.max_income
    if (incomeRatio <= 0.5) {
      score += 20
    } else if (incomeRatio <= 0.75) {
      score += 15
    } else {
      score += 10
    }
  } else {
    score += 10 // No income requirement
  }

  // Age fit (15 points)
  if (profile.age) {
    const ageInRange = (!scheme.min_age || profile.age >= scheme.min_age) &&
                       (!scheme.max_age || profile.age <= scheme.max_age)
    if (ageInRange) {
      score += 15
    }
  }

  // State availability (15 points)
  if (!scheme.applicable_states || scheme.applicable_states.length === 0) {
    score += 15 // Available everywhere
  } else if (scheme.applicable_states.includes(profile.state || "")) {
    score += 15
  }

  return Math.min(score, maxScore)
}

export function sortSchemesByRelevance(profile: Profile, schemes: Scheme[]): Scheme[] {
  return [...schemes]
    .map((scheme) => ({
      scheme,
      score: getEligibilityScore(profile, scheme),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.scheme)
}

export function getSchemeCategories(schemes: Scheme[]): string[] {
  const categories = new Set<string>()
  schemes.forEach((scheme) => {
    if (scheme.category) {
      categories.add(scheme.category)
    }
  })
  return Array.from(categories).sort()
}

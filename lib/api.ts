export async function saveScheme(
  schemeId: string,
  status: string = "saved",
  notes: string = ""
) {
  const response = await fetch("/api/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scheme_id: schemeId, status, notes }),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export async function removeSavedScheme(savedSchemeId: string) {
  const response = await fetch(`/api/bookmarks?id=${savedSchemeId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export async function getSavedSchemes() {
  const response = await fetch("/api/bookmarks")

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export async function updateSavedScheme(
  savedSchemeId: string,
  updates: { status?: string; notes?: string }
) {
  const response = await fetch("/api/bookmarks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: savedSchemeId, ...updates }),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export async function getChecklistItems(savedSchemeId: string) {
  const response = await fetch(
    `/api/checklists?saved_scheme_id=${savedSchemeId}`
  )

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export async function addChecklistItem(
  savedSchemeId: string,
  documentName: string
) {
  const response = await fetch("/api/checklists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      saved_scheme_id: savedSchemeId,
      document_name: documentName,
    }),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export async function updateChecklistItem(itemId: string, isCompleted: boolean) {
  const response = await fetch("/api/checklists", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: itemId, is_completed: isCompleted }),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export async function deleteChecklistItem(itemId: string) {
  const response = await fetch(`/api/checklists?id=${itemId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export async function getSchemes(
  category?: string,
  state?: string,
  search?: string
) {
  const params = new URLSearchParams()
  if (category) params.append("category", category)
  if (state) params.append("state", state)
  if (search) params.append("search", search)

  const response = await fetch(`/api/schemes?${params.toString()}`)

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export async function getProfile() {
  const response = await fetch("/api/profile")

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export async function updateProfile(profileData: any) {
  const response = await fetch("/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateBookmarkForm(data: { url: string; title: string }) {
  const errors: { url?: string; title?: string } = {};

  if (!data.url.trim()) {
    errors.url = 'URL is required';
  } else if (!isValidUrl(data.url)) {
    errors.url = 'Please enter a valid URL';
  } else if (data.url.length > 2048) {
    errors.url = 'URL must be less than 2048 characters';
  }

  if (!data.title.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > 200) {
    errors.title = 'Title must be less than 200 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

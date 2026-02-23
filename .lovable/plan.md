
# Fix About Us Page Images to Be HVAC-Related

## Problem
The About Us page has 3 images that are either broken or completely unrelated to HVAC:

1. **"Who We Are" section** -- Currently shows **headphones** (completely wrong)
2. **"Our Story" section** -- Shows a **welder with sparks** (industrial, not HVAC)
3. **"What We Offer" section** -- Image is **broken/not loading** (showing alt text only)

The hero image (Southern-style home with porch) is appropriate and will stay.

## Solution
Generate 3 new HVAC-specific images using AI image generation, upload them to file storage, and update the database records for each section.

### Image Replacements

| Section | Current | New Image |
|---------|---------|-----------|
| Who We Are | Headphones | HVAC technician inspecting a residential furnace in a utility room |
| Our Story | Welder sparks | Friendly HVAC team standing by a service van with tools |
| What We Offer | Broken image | Outdoor AC condenser unit beside a brick home |

### Technical Steps

1. **Generate 3 images** using AI image generation with HVAC-specific prompts
2. **Save images** to `src/assets/` as local files
3. **Upload images** to the `media` storage bucket
4. **Update database** -- Run SQL updates on the `page_sections` table to set the new image URLs in `content_json` for each of the 3 section IDs:
   - `2b31fae6` (Who We Are)
   - `bbe40fe8` (Our Story)
   - `61c6f3db` (What We Offer)

No code file changes are needed -- this is purely a content/asset update via database and storage.

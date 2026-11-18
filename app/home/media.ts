// Every showcase file the landing pages play. Swap a URL here when a new asset is generated; null means "not made yet".
export const MEDIA = "https://ai-cave.tos-ap-southeast-3.bytepluses.com/mockup";

export const landingMedia = {
  create: {
    image: `${MEDIA}/generate-smarter/5.jpg`,
    video: `${MEDIA}/herosection/2.mp4`,
    avatar: `${MEDIA}/ultra-realistic-human/1.mp4`,
  },
  workflow: {
    // One clip carries all four steps: paused on frame one it is the generated image, playing it is the video.
    clip: `${MEDIA}/herosection/4.mp4`,
    joinedClips: [`${MEDIA}/herosection/3.mp4`, `${MEDIA}/ai-video-generate/1.mp4`],
    library: [
      `${MEDIA}/generate-smarter/7.jpg`,
      `${MEDIA}/herosection/5.jpeg`,
      `${MEDIA}/generate-smarter/2.jpeg`,
      `${MEDIA}/future-of-ai/2.jpeg`,
      `${MEDIA}/herosection/1.jpg`,
      `${MEDIA}/generate-smarter/8.jpg`,
      `${MEDIA}/future-of-ai/4.jpeg`,
      `${MEDIA}/generate-smarter/3.jpeg`,
    ],
  },
  // Until a matching reference clip is generated, the existing motion-transfer result plays alone.
  motion: { source: null as string | null, result: `${MEDIA}/ai-video-generate/1.mp4` as string | null },
  // Waiting on a generated Thai voiceover (~10 s).
  voice: { audio: null as string | null },
  photoEvent: `${MEDIA}/automate-workflow/3.png`,
  community: [`${MEDIA}/generate-smarter/7.jpg`, `${MEDIA}/generate-smarter/8.jpg`, `${MEDIA}/future-of-ai/2.jpeg`],
};

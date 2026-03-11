export const BILIBILI_TARGET_SELECTORS = {
  videoDescription: [
    ".video-desc-container",
    ".desc-info-text",
    ".basic-desc-info",
    ".desc-info"
  ],
  commentBody: [
    ".reply-content",
    ".sub-reply-item .reply-content",
    ".root-reply-container .reply-content",
    ".reply-box .reply-content"
  ],
  dynamicBody: [
    ".bili-rich-text__content",
    ".opus-module-content",
    ".opus-module-text",
    ".dyn-card-opus__content"
  ]
} as const;

export const ALL_BILIBILI_TARGET_SELECTORS = Object.values(BILIBILI_TARGET_SELECTORS).flat();

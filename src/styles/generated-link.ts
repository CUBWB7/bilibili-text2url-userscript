export const GENERATED_LINK_CLASS = "bili-text2url-link";
export const GENERATED_LINK_ATTR = "data-bili-text2url-generated";
export const GENERATED_LINK_STYLE_ID = "bili-text2url-style";

export const GENERATED_LINK_STYLE = `
.${GENERATED_LINK_CLASS}[${GENERATED_LINK_ATTR}="true"] {
  color: #1677ff;
  text-decoration: none;
  word-break: break-all;
}
`;

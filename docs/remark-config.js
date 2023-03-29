import remarkGFM from "remark-gfm";
import remarkHeadingId from "remark-heading-id";
import rehypeSlug from "rehype-slug";
import remarkToc from 'remark-toc'
import remarkRehype from 'remark-rehype'
import rehypeStringify from "rehype-stringify";

export const remarkPlugins = [
    remarkGFM,
    remarkHeadingId,
    [remarkToc, { maxDepth: 3, tight: true }],
];
export const rehypePlugins = [
    rehypeSlug,
];
export default {
    plugins: [...remarkPlugins, remarkRehype, ...rehypePlugins, rehypeStringify],
};

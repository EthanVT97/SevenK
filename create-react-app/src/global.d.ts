declare module '*.tsx' {
    import { FC } from 'react';
    const component: FC;
    export default component;
}

declare module '*.png' {
    const content: string;
    export default content;
} 
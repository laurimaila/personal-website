import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
    test('is rendered', () => {
        render(<Header />);
    });
});

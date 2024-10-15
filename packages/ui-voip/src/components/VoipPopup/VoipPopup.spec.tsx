import { mockAppRoot } from '@rocket.chat/mock-providers';
import { composeStories } from '@storybook/testing-react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { useVoipSession } from '../../hooks/useVoipSession';
import { createMockVoipSession } from '../../tests/mocks';
import { replaceReactAriaIds } from '../../tests/utils/replaceReactAriaIds';
import VoipPopup from './VoipPopup';
import * as stories from './VoipPopup.stories';

jest.mock('../../hooks/useVoipSession', () => ({
	useVoipSession: jest.fn(),
}));

jest.mock('../../hooks/useVoipDialer', () => ({
	useVoipDialer: jest.fn(() => ({ open: true, openDialer: () => undefined, closeDialer: () => undefined })),
}));

const mockedUseVoipSession = jest.mocked(useVoipSession);
const appRoot = mockAppRoot();

it('should properly render incoming popup', async () => {
	mockedUseVoipSession.mockImplementationOnce(() => createMockVoipSession({ type: 'INCOMING' }));
	render(<VoipPopup />, { wrapper: appRoot.build(), legacyRoot: true });

	expect(screen.getByTestId('vc-popup-incoming')).toBeInTheDocument();
});

it('should properly render ongoing popup', async () => {
	mockedUseVoipSession.mockImplementationOnce(() => createMockVoipSession({ type: 'ONGOING' }));

	render(<VoipPopup />, { wrapper: appRoot.build(), legacyRoot: true });

	expect(screen.getByTestId('vc-popup-ongoing')).toBeInTheDocument();
});

it('should properly render outgoing popup', async () => {
	mockedUseVoipSession.mockImplementationOnce(() => createMockVoipSession({ type: 'OUTGOING' }));

	render(<VoipPopup />, { wrapper: appRoot.build(), legacyRoot: true });

	expect(screen.getByTestId('vc-popup-outgoing')).toBeInTheDocument();
});

it('should properly render error popup', async () => {
	mockedUseVoipSession.mockImplementationOnce(() => createMockVoipSession({ type: 'ERROR' }));

	render(<VoipPopup />, { wrapper: appRoot.build(), legacyRoot: true });

	expect(screen.getByTestId('vc-popup-error')).toBeInTheDocument();
});

it('should properly render dialer popup', async () => {
	render(<VoipPopup />, { wrapper: appRoot.build(), legacyRoot: true });

	expect(screen.getByTestId('vc-popup-dialer')).toBeInTheDocument();
});

it('should prioritize session over dialer', async () => {
	mockedUseVoipSession.mockImplementationOnce(() => createMockVoipSession({ type: 'INCOMING' }));

	render(<VoipPopup />, { wrapper: appRoot.build(), legacyRoot: true });

	expect(screen.queryByTestId('vc-popup-dialer')).not.toBeInTheDocument();
	expect(screen.getByTestId('vc-popup-incoming')).toBeInTheDocument();
});

const testCases = Object.values(composeStories(stories)).map((story) => [story.storyName || 'Story', story]);

test.each(testCases)(`renders %s without crashing`, async (_storyname, Story) => {
	const tree = render(<Story />, { wrapper: appRoot.build(), legacyRoot: true });
	expect(replaceReactAriaIds(tree.baseElement)).toMatchSnapshot();
});

test.each(testCases)('%s should have no a11y violations', async (_storyname, Story) => {
	const { container } = render(<Story />, { wrapper: appRoot.build(), legacyRoot: true });

	const results = await axe(container);
	expect(results).toHaveNoViolations();
});
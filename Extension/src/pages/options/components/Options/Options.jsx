import React, {
    useContext,
    useEffect,
} from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import { observer } from 'mobx-react';

import { General } from '../General';
import { Sidebar } from '../Sidebar';
import { Filters } from '../Filters';
import { Stealth } from '../Stealth';
import { Allowlist } from '../Allowlist';
import { UserRules } from '../UserRules';
import { Miscellaneous } from '../Miscellaneous';
import { About } from '../About';
import { Footer } from '../Footer';
import { rootStore } from '../../stores/RootStore';
import { Notifications } from '../Notifications';
import { messenger } from '../../../services/messenger';
import { log } from '../../../../common/log';
import { Icons } from '../../../common/components/ui/Icons';
import { NOTIFIER_TYPES } from '../../../../common/constants';

import '../../styles/styles.pcss';

const Options = observer(() => {
    const { settingsStore } = useContext(rootStore);

    useEffect(() => {
        let removeListenerCallback = () => {};

        (async () => {
            await settingsStore.requestOptionsData();

            const events = [
                NOTIFIER_TYPES.REQUEST_FILTER_UPDATED,
                NOTIFIER_TYPES.UPDATE_ALLOWLIST_FILTER_RULES,
                NOTIFIER_TYPES.FILTERS_UPDATE_CHECK_READY,
                NOTIFIER_TYPES.SETTING_UPDATED,
            ];

            removeListenerCallback = await messenger.createEventListener(
                events,
                async (message) => {
                    const { type } = message;

                    switch (type) {
                        case NOTIFIER_TYPES.REQUEST_FILTER_UPDATED: {
                            await settingsStore.getUserRules();
                            await settingsStore.requestOptionsData();
                            break;
                        }
                        case NOTIFIER_TYPES.UPDATE_ALLOWLIST_FILTER_RULES: {
                            await settingsStore.getAllowlist();
                            break;
                        }
                        case NOTIFIER_TYPES.FILTERS_UPDATE_CHECK_READY: {
                            const { data: updatedFilters } = message;
                            settingsStore.refreshFilters(updatedFilters);
                            break;
                        }
                        case NOTIFIER_TYPES.SETTING_UPDATED: {
                            await settingsStore.requestOptionsData();
                            break;
                        }
                        default: {
                            log.debug('Undefined message type:', type);
                            break;
                        }
                    }
                },
            );
        })();

        return () => {
            removeListenerCallback();
        };
    }, []);

    if (!settingsStore.optionsReadyToRender) {
        return null;
    }

    return (
        <HashRouter hashType="noslash">
            <Icons />
            <div className="page">
                <Sidebar />
                <div className="content">
                    <Switch>
                        <Route path="/" exact component={General} />
                        <Route path="/filters" component={Filters} />
                        <Route path="/stealth" component={Stealth} />
                        <Route path="/allowlist" component={Allowlist} />
                        <Route path="/user-filter" component={UserRules} />
                        <Route path="/miscellaneous" component={Miscellaneous} />
                        <Route path="/about" component={About} />
                        <Route component={General} />
                    </Switch>
                </div>
            </div>
            <Footer />
            <Notifications />
        </HashRouter>
    );
});

export { Options };
import {fetchFieldsRequest, fetchFieldsSuccess, fetchFieldsError, postFieldsRequest, postFieldsSuccess, postFieldsError} from '../Actions/AcfGroups';

export default class AcfGroupService {
    constructor(store) {
        this.store = store;
        this.fetch = null;
        this.request = null;

        this.store.subscribe(() => this.initFetch());
        this.store.subscribe(() => this.checkForPost());
    }

    initFetch() {
        if (this.fetch) {
            return;
        }

        const state = this.store.getState();

        if (state.Group.PostId < 1) {
            return;
        }
        if (!state.Group.doFetching) {
            return;
        }

        this.fetch = {
            path: `/acf-gutenberg/v1/meta=${parseInt(state.Group.PostId,10)}`,
            method: 'GET',
            contentType: 'application/json',
            success: response => {
                this.fetch = null;
                this.store.dispatch(fetchFieldsSuccess(this.addKeysToDraggables(response)));
            },
            error: error => {
                this.fetch = null;
                this.store.dispatch(fetchFieldsSuccess(error.responseJSON.data.status, error.responseJSON.message));
            }
        };
        this.store.dispatch(fetchFieldsRequest());
        wp.apiRequest(this.fetch);
    }

    addKeysToDraggables(obj) {
        const draggables = [
            'flexible_content',
            'repeater'
        ];
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (typeof obj[property] === 'object' && obj[property] !== null) {
                    obj[property] = this.addKeysToDraggables(obj[property]);
                }
                if (!obj.hasOwnProperty('type') || (obj.hasOwnProperty('type') && draggables.indexOf(obj.type) === -1 )) {
                    continue;
                }
                if (!obj.hasOwnProperty('key') || !obj.hasOwnProperty('value')) {
                    continue;
                }
                if (!Array.isArray(obj.value)) {
                    continue;
                }
                obj.value.map((row, i) => {
                    obj.value[i].key = `${obj.key}-${i}`;
                    obj.value.id = i;
                })
            }
        }
        return obj;
    }

    checkForPost() {
        if (this.request) {
            return;
        }

        const state = this.store.getState();

        if (state.Group.PostId < 1) {
            return;
        }
        if (!state.Group.doPosting) {
            return;
        }
        this.request = {
            path: `/acf-gutenberg/v1/group=${state.Group.Key}&id=${parseInt(state.Group.PostId,10)}`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({fields: state.Group.Fields}),
            success: response => {
                this.request = null;
                this.store.dispatch(postFieldsSuccess());
            },
            error: error => {
                this.request = null;
                this.store.dispatch(postFieldsError(error.responseJSON.data.status, error.responseJSON.message));
            }
        };
        this.store.dispatch(postFieldsRequest());
        wp.apiRequest(this.request);
    }
}

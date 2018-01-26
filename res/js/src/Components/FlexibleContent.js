import {Component} from 'react';
import Field from './Field';
import {ACF_COMPONENTS} from './Group';
import NotSupported from './NotSupported';

export default class FlexibleContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toggled: false
        }
    }
    getValue() {
        return Array.isArray(this.props.value) ? this.props.value : [];
    }
    onChange(i, layoutKey, key, value) {
        let newValue = this.getValue();
        newValue[i][key] = value;
        this.props.onChange(this.props.acfKey, newValue);
    }
    getFieldProps(field, row, i) {
        let fieldProps = JSON.parse(JSON.stringify(field));
        fieldProps.fieldId = `'acf-${this.props.acfKey}-${i}-`;
        fieldProps.fieldName = `acf[${this.props.acfKey}][${i}]`;
        fieldProps.value = row[field.key];
        return fieldProps;
    }
    onModifyRows(i, type = 'add', layout = false) {
        if (this.state.toggled !== false) {
            this.setState({toggled: false});
        }
        let newValue = this.getValue();
        if (type === 'add') {
            var emptyRow = {
                'acf_fc_layout' : this.props.layouts[layout].name
            };
            this.props.layouts[layout]['sub_fields'].map(field => {
                emptyRow[field.key] = field['default_value'];
            });
            newValue.splice(i, 0, emptyRow);
        } else {
            newValue.splice(i, 1);
        }
        this.props.onChange(this.props.acfKey, newValue);
    }
    onDisplayLayouts(i){
        let toggled = false;
        if (this.state.toggled !== i) {
            toggled = i;
        }
        this.setState({toggled});
    }
    displayLayouts(i) {
        return (
            <div className="acf-fc-popup -top -left" style={{bottom: 'calc(100% + 8px)', right: 0}}>
                <ul>
                    {Object.keys(this.props.layouts).map(key => {
                        return (<li><a href="#" onClick={() => this.onModifyRows(i, 'add', key)}>{this.props.layouts[key].label}</a></li>)
                    })}
                </ul>
            </div>
        );
    }
    getLayoutKey(row) {
        let layoutSlug = row['acf_fc_layout'],
            layoutKey = false;
        Object.keys(this.props.layouts).map(key => {
            let layout = this.props.layouts[key];
            if (layout.name === layoutSlug && false === layoutKey) {
                layoutKey = key;
            }
        });
        return layoutKey;
    }
    getFields(layoutKey) {
        return this.props.layouts[layoutKey]['sub_fields'];
    }
    render() {
        let buttonLabel = this.props['button_label'] ? this.props['button_label'] : wp.i18n.__('Add Row');
        let value = this.getValue();
        return (
            <Field {...this.props}>
                <div className={`acf-flexible-content`}>
                    { value < 1 ? (
                        <div className="no-value-message">
                            {wp.i18n.__('Click the "Add Row" button below to start creating your layout')}
                        </div>
                    ) : (
                        <div className="values">
                            { value.map((row, i) => {
                                let layoutKey = this.getLayoutKey(row),
                                    updateRow = (key, value) => {
                                        this.onChange(i, layoutKey, key, value)
                                    };
                                return (
                                    <div className="layout">
                                        <div className="acf-fc-layout-handle ui-sortable-handle" title="Drag to reorder" data-name="collapse-layout">
                                            <span className="acf-fc-layout-order">{i + 1}</span>
                                            {this.props.layouts[layoutKey].label}
                                        </div>
                                        <div className="acf-fc-layout-controlls">
                                            <a className="acf-icon -plus small light acf-js-tooltip" href="#"  style={{display: 'block'}} title={wp.i18n.__('Add Layout')} onClick={() => this.onDisplayLayouts(i)}/>
                                            <a className="acf-icon -minus small light acf-js-tooltip" href="#" style={{display: 'block'}} title={wp.i18n.__('Remove Layout')} onClick={() => this.onModifyRows(i, 'remove')}/>
                                            <a className="acf-icon -collapse small acf-js-tooltip" href="#" data-name="collapse-layout" title="Click to toggle"/>
                                        </div>
                                        {this.state.toggled === i ? this.displayLayouts(i) : ''}
                                        <div className="acf-fields ">
                                            { this.getFields(layoutKey).map(field => {
                                                let TagName = ACF_COMPONENTS[field.type] ? ACF_COMPONENTS[field.type] : NotSupported;
                                                let fieldProps = this.getFieldProps(field, row, i);
                                                return (<TagName acfKey={field.key} {...fieldProps} onChange={updateRow} />);
                                            }) }
                                        </div>
                                    </div>
                                );
                            }) }
                        </div>
                    )}
                    <div className="acf-actions" style={{position: 'relative'}}>
                        {this.state.toggled === value.length ? this.displayLayouts(value.length) : ''}
                        <a className="acf-button button button-primary" href="#" onClick={() => this.onDisplayLayouts(value.length)}>
                            {buttonLabel}
                        </a>
                    </div>
                </div>
            </Field>
        )
    }
}

"use strict";
/**
 * Unit tests for RoblexModel
 */
Object.defineProperty(exports, "__esModule", { value: true });
const RoblexModel_js_1 = require("../models/RoblexModel.js");
const events_1 = require("events");
describe('RoblexModel', () => {
    let model;
    beforeEach(() => {
        model = new RoblexModel_js_1.RoblexModel('test-model');
    });
    test('should create a new model with the given name', () => {
        expect(model.name).toBe('test-model');
        expect(model.state).toEqual({});
    });
    test('should set and get values correctly', () => {
        model.setValue('key1', 'value1');
        model.setValue('key2', 42);
        expect(model.getValue('key1')).toBe('value1');
        expect(model.getValue('key2')).toBe(42);
        expect(model.getValue('nonexistent')).toBeUndefined();
        expect(model.getValue('nonexistent', 'default')).toBe('default');
    });
    test('should set multiple values at once', () => {
        model.setValues({
            key1: 'value1',
            key2: 42,
            key3: { nested: true }
        });
        expect(model.getValue('key1')).toBe('value1');
        expect(model.getValue('key2')).toBe(42);
        expect(model.getValue('key3')).toEqual({ nested: true });
    });
    test('should emit change events when values are set', () => {
        const listener = jest.fn();
        model.on('change', listener);
        model.setValue('key1', 'value1');
        expect(listener).toHaveBeenCalledWith({
            key: 'key1',
            value: 'value1',
            previousValue: undefined
        });
        model.setValue('key1', 'updated');
        expect(listener).toHaveBeenCalledWith({
            key: 'key1',
            value: 'updated',
            previousValue: 'value1'
        });
        expect(listener).toHaveBeenCalledTimes(2);
    });
    test('should emit change events for multiple values', () => {
        const listener = jest.fn();
        model.on('change', listener);
        model.setValues({
            key1: 'value1',
            key2: 42
        });
        expect(listener).toHaveBeenCalledTimes(2);
    });
    test('should not emit change event when value is unchanged', () => {
        model.setValue('key1', 'value1');
        const listener = jest.fn();
        model.on('change', listener);
        model.setValue('key1', 'value1');
        expect(listener).not.toHaveBeenCalled();
    });
    test('should get all values as state object', () => {
        model.setValues({
            key1: 'value1',
            key2: 42,
            key3: { nested: true }
        });
        expect(model.state).toEqual({
            key1: 'value1',
            key2: 42,
            key3: { nested: true }
        });
    });
    test('should implement EventEmitter interface', () => {
        expect(model).toBeInstanceOf(events_1.EventEmitter);
        const listener = jest.fn();
        model.on('custom-event', listener);
        model.emit('custom-event', 'test-data');
        expect(listener).toHaveBeenCalledWith('test-data');
    });
    test('should clear all values', () => {
        model.setValues({
            key1: 'value1',
            key2: 42
        });
        expect(model.state).not.toEqual({});
        model.clear();
        expect(model.state).toEqual({});
    });
});
//# sourceMappingURL=models.test.js.map
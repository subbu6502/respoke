
var expect = chai.expect;

respoke.log.setLevel('warn');

describe("respoke.CallState", function () {
    var state;
    var params = {
        receiveOnly: false,
        directConnectionOnly: false,
        previewLocalMedia: function () {},
        approve: function () {}
    };

    describe("it's object structure", function () {
        beforeEach(function () {
            state = respoke.CallState({gloveColor: 'white'});
        });

        it("has the correct class name.", function () {
            expect(state.className).to.equal('respoke.CallState');
        });

        it("contains some important methods.", function () {
            expect(typeof state.dispatch).to.equal('function');
            expect(typeof state.isModifying).to.equal('function');
            expect(typeof state.isState).to.equal('function');
            expect(typeof state.currentState).to.equal('function');
        });

        it("saves unexpected attributes", function () {
            expect(state.gloveColor).to.equal('white');
        });

        it("has not been run", function () {
            expect(state.currentState()).to.equal.undefined;
        });

        it("should not report modifying", function () {
            expect(state.isModifying()).to.equal(false);
        });
    });

    describe("for the caller", function () {
        describe("when starting from 'idle'", function () {
            var idleSpy;

            beforeEach(function () {
                params = {
                    caller: true,
                    directConnectionOnly: false,
                    previewLocalMedia: function () {},
                    receiveOnly: false,
                    approve: function () {}
                };
                state = respoke.CallState({caller: true});
            });

            it("reports the correct state name", function () {
                expect(state.currentState().name).to.equal("idle");
            });

            it("should not report modifying", function () {
                expect(state.isModifying()).to.equal(false);
            });

            describe('invalid event', function () {
                var invalidEvents = [
                    'answer',
                    'receiveLocalMedia',
                    'approve',
                    'sentOffer',
                    'accept',
                    'receiveRemoteMedia',
                    'receiveAnswer',
                    'modify'
                ];

                invalidEvents.forEach(function (evt) {
                    describe("event " + evt, function () {
                        var currentState;

                        beforeEach(function () {
                            currentState = state.currentState().name;
                            state.dispatch(evt);
                        });

                        it("invalid event " + evt + " doesn't move to a new state", function () {
                            expect(state.currentState().name).to.equal(currentState);
                        });
                    });
                });
            });

            describe("event 'hangup'", function () {
                var terminatedEntrySpy;

                beforeEach(function () {
                    terminatedEntrySpy = sinon.spy();
                    state.listen('terminated:entry', terminatedEntrySpy);
                    state.dispatch("hangup");
                });

                afterEach(function () {
                    state.ignore('terminated:entry', terminatedEntrySpy);
                });

                it("leads to 'terminated'", function () {
                    expect(state.currentState().name).to.equal("terminated");
                });

                it("should not report modifying", function () {
                    expect(state.isModifying()).to.equal(false);
                });

                it("should fire the 'terminated:entry' event", function () {
                    expect(terminatedEntrySpy.called).to.equal(true);
                });
            });

            describe("event 'initiate'", function () {
                describe("when a call listener is attached", function () {
                    var preparingEntrySpy;

                    beforeEach(function () {
                        preparingEntrySpy = sinon.spy();
                        state.listen('preparing:entry', preparingEntrySpy);
                        state.dispatch("initiate", {
                            client: {
                                hasListeners: function () { return true; }
                            }
                        });
                    });

                    afterEach(function () {
                        state.ignore('preparing:entry', preparingEntrySpy);
                    });

                    it("leads to 'preparing'", function () {
                        expect(state.currentState().name).to.equal("preparing");
                    });

                    it("should not report modifying", function () {
                        expect(state.isModifying()).to.equal(false);
                    });

                    it("should fire the 'preparing:entry' event", function () {
                        expect(preparingEntrySpy.called).to.equal(true);
                    });

                    describe("when isMediaFlowing is false", function () {
                        beforeEach(function () {
                            state.isMediaFlowing = false;
                        });

                        describe("event 'hangup'", function () {
                            var terminatedEntrySpy;

                            beforeEach(function () {
                                terminatedEntrySpy = sinon.spy();
                                state.listen('terminated:entry', terminatedEntrySpy);
                                state.dispatch("hangup");
                            });

                            afterEach(function () {
                                state.ignore('terminated:entry', terminatedEntrySpy);
                            });

                            it("leads to 'terminated'", function () {
                                expect(state.currentState().name).to.equal("terminated");
                            });

                            it("should not report modifying", function () {
                                expect(state.isModifying()).to.equal(false);
                            });

                            it("should fire the 'terminated:entry' event", function () {
                                expect(terminatedEntrySpy.called).to.equal(true);
                            });
                        });

                        describe('invalid event', function () {
                            var invalidEvents = [
                                'initiate',
                                'receiveLocalMedia',
                                'approve',
                                'sentOffer',
                                'receiveRemoteMedia',
                                'accept',
                                'receiveAnswer',
                                'modify'
                            ];

                            invalidEvents.forEach(function (evt) {
                                describe("event " + evt, function () {
                                    var currentState;

                                    beforeEach(function () {
                                        currentState = state.currentState().name;
                                        state.dispatch(evt);
                                    });

                                    it("doesn't move to a new state", function () {
                                        expect(state.currentState().name).to.equal(currentState);
                                    });
                                });
                            });
                        });

                        describe("event 'reject'", function () {
                            var preparingExitSpy;
                            var terminatedEntrySpy;

                            beforeEach(function () {
                                preparingExitSpy = sinon.spy();
                                terminatedEntrySpy = sinon.spy();
                                state.listen('preparing:exit', preparingExitSpy);
                                state.listen('terminated:entry', terminatedEntrySpy);
                                state.dispatch("reject");
                            });

                            afterEach(function () {
                                state.ignore('preparing:exit', preparingExitSpy);
                                state.ignore('terminated:entry', terminatedEntrySpy);
                            });

                            it("leads to 'terminated'", function () {
                                expect(state.currentState().name).to.equal("terminated");
                            });

                            it("should not report modifying", function () {
                                expect(state.isModifying()).to.equal(false);
                            });

                            it("should fire the 'preparing:exit' event", function () {
                                expect(preparingExitSpy.called).to.equal(true);
                            });

                            it("should fire the 'terminated:entry' event", function () {
                                expect(terminatedEntrySpy.called).to.equal(true);
                            });

                            describe('invalid event', function () {
                                var invalidEvents = [
                                    'initiate',
                                    'reject',
                                    'answer',
                                    'receiveLocalMedia',
                                    'accept',
                                    'approve',
                                    'sentOffer',
                                    'receiveRemoteMedia',
                                    'receiveAnswer',
                                    'modify'
                                ];

                                invalidEvents.forEach(function (evt) {
                                    describe("event " + evt, function () {
                                        var currentState;

                                        beforeEach(function () {
                                            currentState = state.currentState().name;
                                            state.dispatch(evt);
                                        });

                                        it("doesn't move to a new state", function () {
                                            expect(state.currentState().name).to.equal(currentState);
                                        });
                                    });
                                });
                            });
                        });

                        describe("event 'answer'", function () {
                            var approvingDeviceAccessEntrySpy = sinon.spy();

                            beforeEach(function () {
                                state.listen('approving-device-access:entry', approvingDeviceAccessEntrySpy);
                                state.dispatch('answer', params);
                            });

                            afterEach(function () {
                                state.ignore('approving-device-access:entry', approvingDeviceAccessEntrySpy);
                            });

                            it("moves to 'approvingDeviceAccess'", function () {
                                expect(state.currentState().name).to.equal('approvingDeviceAccess');
                            });

                            it("fires 'approving-device-access:entry'", function () {
                                expect(approvingDeviceAccessEntrySpy.called).to.equal(true);
                            });

                            describe('invalid event', function () {
                                var invalidEvents = [
                                    'initiate',
                                    'answer',
                                    'receiveLocalMedia',
                                    'sentOffer',
                                    'accept',
                                    'receiveRemoteMedia',
                                    'receiveAnswer',
                                    'modify'
                                ];

                                invalidEvents.forEach(function (evt) {
                                    describe("event " + evt, function () {
                                        var currentState;

                                        beforeEach(function () {
                                            currentState = state.currentState().name;
                                            state.dispatch(evt, params || {});
                                        });

                                        it("doesn't move to a new state", function () {
                                            expect(state.currentState().name).to.equal(currentState);
                                        });
                                    });
                                });
                            });

                            describe("event 'approve'", function () {
                                var approvingContentEntrySpy;

                                beforeEach(function () {
                                    approvingContentEntrySpy = sinon.spy();
                                    state.listen('approving-content:entry', approvingContentEntrySpy);
                                    state.dispatch('approve', params);
                                });

                                afterEach(function () {
                                    state.ignore('approving-content:entry', approvingContentEntrySpy);
                                });

                                it("moves to 'approvingContent'", function () {
                                    expect(state.currentState().name).to.equal('approvingContent');
                                });

                                it("fires 'approving-content:entry'", function () {
                                    expect(approvingContentEntrySpy.called).to.equal(true);
                                });

                                describe('invalid event', function () {
                                    var invalidEvents = [
                                        'initiate',
                                        'answer',
                                        'receiveLocalMedia',
                                        'sentOffer',
                                        'receiveRemoteMedia',
                                        'receiveAnswer',
                                        'accept',
                                        'modify'
                                    ];

                                    invalidEvents.forEach(function (evt) {
                                        describe("event " + evt, function () {
                                            var currentState;

                                            beforeEach(function () {
                                                currentState = state.currentState().name;
                                                state.dispatch(evt, params || {});
                                            });

                                            it("doesn't move to a new state", function () {
                                                expect(state.currentState().name).to.equal(currentState);
                                            });
                                        });
                                    });
                                });

                                describe("event 'approve'", function () {
                                    var offeringEntrySpy;
                                    var approvingContentExitSpy;

                                    beforeEach(function () {
                                        offeringEntrySpy = sinon.spy();
                                        approvingContentExitSpy = sinon.spy();
                                        state.listen('offering:entry', offeringEntrySpy);
                                        state.listen('approving-content:exit', approvingContentExitSpy);
                                    });

                                    afterEach(function () {
                                        state.ignore('offering:entry', offeringEntrySpy);
                                    });

                                    describe("when we have received local media already", function () {
                                        beforeEach(function () {
                                            state.hasLocalMedia = true;
                                            state.dispatch('approve', params);
                                        });

                                        afterEach(function () {
                                            state.hasLocalMedia = false;
                                        });

                                        it("sets the hasLocalMediaApproval flag", function () {
                                            expect(state.hasLocalMediaApproval).to.equal(true);
                                        });

                                        it("moves to 'offering'", function () {
                                            expect(state.currentState().name).to.equal('offering');
                                        });

                                        it("fires 'approving-content:exit'", function () {
                                            expect(approvingContentExitSpy.called).to.equal(true);
                                        });

                                        it("fires 'offering:entry'", function () {
                                            expect(offeringEntrySpy.called).to.equal(true);
                                        });

                                        describe('invalid event', function () {
                                            var invalidEvents = [
                                                'initiate',
                                                'answer',
                                                'approve',
                                                'accept',
                                                'sentOffer',
                                                'modify'
                                            ];

                                            invalidEvents.forEach(function (evt) {
                                                describe("event " + evt, function () {
                                                    var currentState;

                                                    beforeEach(function () {
                                                        currentState = state.currentState().name;
                                                        state.dispatch(evt, params || {});
                                                    });

                                                    it("doesn't move to a new state", function () {
                                                        expect(state.currentState().name).to.equal(currentState);
                                                    });
                                                });
                                            });
                                        });

                                        describe("event 'receiveLocalMedia'", function () {
                                            beforeEach(function () {
                                                state.hasLocalMedia = false;
                                                state.dispatch('receiveLocalMedia');
                                            });

                                            it("sets the 'receiveLocalMedia' flag", function () {
                                                expect(state.hasLocalMedia).to.equal(true);
                                            });

                                            it("does not move to another state", function () {
                                                expect(state.currentState().name).to.equal('offering');
                                            });
                                        });

                                        describe("event 'receiveAnswer'", function () {
                                            var connectingEntrySpy;

                                            beforeEach(function () {
                                                connectingEntrySpy = sinon.spy();
                                                state.listen('connecting:entry', connectingEntrySpy);
                                                state.dispatch('sentOffer');
                                                state.dispatch('receiveAnswer');
                                            });

                                            afterEach(function () {
                                                state.ignore('connecting:entry', connectingEntrySpy);
                                            });

                                            it("moves to 'connecting'", function () {
                                                expect(state.currentState().name).to.equal('connecting');
                                            });

                                            it("fires 'connecting:entry'", function () {
                                                expect(connectingEntrySpy.called).to.equal(true);
                                            });

                                            describe('invalid event', function () {
                                                var invalidEvents = [
                                                    'initiate',
                                                    'answer',
                                                    'receiveLocalMedia',
                                                    'approve',
                                                    'sentOffer',
                                                    'accept',
                                                    'receiveAnswer',
                                                    'modify'
                                                ];

                                                invalidEvents.forEach(function (evt) {
                                                    describe("event " + evt, function () {
                                                        var currentState;

                                                        beforeEach(function () {
                                                            currentState = state.currentState().name;
                                                            state.dispatch(evt, params || {});
                                                        });

                                                        it("doesn't move to a new state", function () {
                                                            expect(state.currentState().name).to.equal(currentState);
                                                        });
                                                    });
                                                });
                                            });

                                            describe("event 'receiveRemoteMedia'", function () {
                                                var connectedEntrySpy;

                                                beforeEach(function () {
                                                    connectedEntrySpy = sinon.spy();
                                                    state.listen('connected:entry', connectedEntrySpy);
                                                    state.dispatch('receiveRemoteMedia');
                                                });

                                                it("moves to the 'connected' state", function () {
                                                    expect(state.currentState().name).to.equal('connected');
                                                });

                                                it("fires the 'connected:entry' event", function () {
                                                    expect(connectedEntrySpy.called).to.equal(true);
                                                });

                                                describe('invalid event', function () {
                                                    var invalidEvents = [
                                                        'initiate',
                                                        'answer',
                                                        'receiveLocalMedia',
                                                        'approve',
                                                        'sentOffer',
                                                        'accept',
                                                        'receiveRemoteMedia',
                                                        'receiveAnswer',
                                                    ];

                                                    invalidEvents.forEach(function (evt) {
                                                        describe("event " + evt, function () {
                                                            var currentState;

                                                            beforeEach(function () {
                                                                currentState = state.currentState().name;
                                                                state.dispatch(evt, params || {});
                                                            });

                                                            it("doesn't move to a new state", function () {
                                                                expect(state.currentState().name).to.equal(currentState);
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });

                                    describe("when we have not received local media yet", function () {
                                        beforeEach(function () {
                                            state.dispatch('approve', params);
                                        });

                                        it("sets the hasLocalMediaApproval flag", function () {
                                            expect(state.hasLocalMediaApproval).to.equal(true);
                                        });

                                        it("stays in 'approvingContent'", function () {
                                            expect(state.currentState().name).to.equal('approvingContent');
                                        });

                                        describe("event 'receiveLocalMedia'", function () {
                                            beforeEach(function () {
                                                state.dispatch('receiveLocalMedia', params);
                                            });

                                            it("sets the 'hasLocalMedia' flag", function () {
                                                expect(state.hasLocalMedia).to.equal(true);
                                            });

                                            it("moves to 'offering'", function () {
                                                expect(state.currentState().name).to.equal('offering');
                                            });

                                            it("fires 'approving-content:exit'", function () {
                                                expect(approvingContentExitSpy.called).to.equal(true);
                                            });

                                            it("fires 'offering:entry'", function () {
                                                expect(offeringEntrySpy.called).to.equal(true);
                                            });
                                        });
                                    });

                                    describe("event 'reject'", function () {
                                        var terminatedSpy;

                                        beforeEach(function () {
                                            terminatedSpy = sinon.spy();
                                            state.listen('terminated:entry', terminatedSpy);
                                            state.dispatch("reject");
                                        });

                                        it("leads to 'terminated'", function () {
                                            expect(state.currentState().name).to.equal("terminated");
                                        });

                                        it("fires the 'terminated:entry' event", function () {
                                            expect(terminatedSpy.called).to.equal(true);
                                        })
                                    });
                                });

                                describe("event 'reject'", function () {
                                    var approvingContentExitSpy;
                                    var preparingExitSpy;

                                    beforeEach(function () {
                                        approvingContentExitSpy = sinon.spy();
                                        preparingExitSpy = sinon.spy();
                                        state.listen('approving-content:exit', approvingContentExitSpy);
                                        state.listen('preparing:exit', preparingExitSpy);
                                        state.dispatch("reject");
                                    });

                                    it("fires 'approving-content:exit'", function () {
                                        expect(approvingContentExitSpy.called).to.equal(true);
                                    });

                                    it("fires 'preparing:exit'", function () {
                                        expect(approvingContentExitSpy.called).to.equal(true);
                                    });

                                    it("leads to 'terminated'", function () {
                                        expect(state.currentState().name).to.equal("terminated");
                                    });
                                });
                            });

                            describe("event 'reject'", function () {
                                beforeEach(function () {
                                    state.dispatch("reject");
                                });

                                it("leads to 'terminated'", function () {
                                    expect(state.currentState().name).to.equal("terminated");
                                });
                            });
                        });
                    });

                    describe("when isMediaFlowing is true", function () {
                        beforeEach(function () {
                            state.isMediaFlowing = true;
                        });

                        describe("event 'hangup'", function () {
                            var terminatedEntrySpy;

                            beforeEach(function () {
                                terminatedEntrySpy = sinon.spy();
                                state.listen('terminated:entry', terminatedEntrySpy);
                                state.dispatch("hangup");
                            });

                            afterEach(function () {
                                state.ignore('terminated:entry', terminatedEntrySpy);
                            });

                            it("leads to 'terminated'", function () {
                                expect(state.currentState().name).to.equal("terminated");
                            });

                            it("should not report modifying", function () {
                                expect(state.isModifying()).to.equal(false);
                            });

                            it("should fire the 'terminated:entry' event", function () {
                                expect(terminatedEntrySpy.called).to.equal(true);
                            });
                        });

                        describe("event 'reject'", function () {
                            var connectedEntrySpy;

                            beforeEach(function () {
                                connectedEntrySpy = sinon.spy();
                                state.listen('connected:entry', connectedEntrySpy);
                                state.dispatch("reject");
                            });

                            afterEach(function () {
                                state.ignore('connected:entry', connectedEntrySpy);
                            });

                            it("leads to 'connected'", function () {
                                expect(state.currentState().name).to.equal("connected");
                            });

                            it("should not report modifying", function () {
                                expect(state.isModifying()).to.equal(false);
                            });

                            it("should fire the 'connected:entry' event", function () {
                                expect(connectedEntrySpy.called).to.equal(true);
                            });

                            describe("event 'modify'", function () {
                                describe("as modify initiator", function () {
                                    var connectedExitSpy;
                                    var modifyingEntrySpy;

                                    beforeEach(function () {
                                        connectedExitSpy = sinon.spy();
                                        modifyingEntrySpy = sinon.spy();
                                        state.listen('connected:exit', connectedExitSpy);
                                        state.listen('modifying:entry', function () {
                                            modifyingEntrySpy();
                                        });
                                        state.dispatch("modify");
                                    });

                                    afterEach(function () {
                                        state.ignore('connected:exit', connectedExitSpy);
                                        state.ignore('modifying:entry', modifyingEntrySpy);
                                    });

                                    it("leads to 'modifying'", function () {
                                        expect(state.currentState().name).to.equal("modifying");
                                    });

                                    it("should report modifying", function () {
                                        expect(state.isModifying()).to.equal(true);
                                    });

                                    it("should fire the 'connected:exit' event", function () {
                                        expect(connectedExitSpy.called).to.equal(true);
                                    });

                                    it("should fire the 'modifying:entry' event", function () {
                                        expect(modifyingEntrySpy.called).to.equal(true);
                                    });

                                    describe("event 'accept'", function () {
                                        var preparingEntrySpy;
                                        var modifyingExitSpy;

                                        beforeEach(function () {
                                            preparingEntrySpy = sinon.spy();
                                            modifyingExitSpy = sinon.spy();
                                            state.listen('preparing:entry', function () {
                                                preparingEntrySpy();
                                            });
                                            state.listen('modifying:exit', function () {
                                                modifyingExitSpy();
                                            });
                                            state.dispatch("accept");
                                        });

                                        afterEach(function () {
                                            state.ignore('preparing:entry', preparingEntrySpy);
                                            state.ignore('modifying:exit', modifyingExitSpy);
                                        });

                                        it("leads to 'preparing'", function () {
                                            expect(state.currentState().name).to.equal("preparing");
                                        });

                                        it("should report modifying", function () {
                                            expect(state.isModifying()).to.equal(true);
                                        });

                                        it("should fire the 'preparing:entry' event", function () {
                                            expect(preparingEntrySpy.called).to.equal(true);
                                        });

                                        it("should fire the 'modifying:exit' event", function () {
                                            expect(modifyingExitSpy.called).to.equal(true);
                                        });

                                        it("should set hasLocalMediaApproval to false", function () {
                                            expect(state.hasLocalMediaApproval).to.equal(false);
                                        });

                                        it("should set hasLocalMedia to false", function () {
                                            expect(state.hasLocalMedia).to.equal(false);
                                        });

                                        it("should set caller to true", function () {
                                            expect(state.caller).to.equal(true);
                                        });
                                    });

                                    describe("event 'reject'", function () {
                                        var connectedEntrySpy;
                                        var modifyingExitSpy;

                                        beforeEach(function () {
                                            connectedEntrySpy = sinon.spy();
                                            modifyingExitSpy = sinon.spy();
                                            state.listen('connected:entry', function () {
                                                connectedEntrySpy();
                                            });
                                            state.listen('modifying:exit', function () {
                                                modifyingExitSpy();
                                            });
                                            state.dispatch("reject");
                                        });

                                        afterEach(function () {
                                            state.ignore('connected:entry', connectedEntrySpy);
                                            state.ignore('modifying:exit', modifyingExitSpy);
                                        });

                                        it("leads to 'connected'", function () {
                                            expect(state.currentState().name).to.equal("connected");
                                        });

                                        it("should not report modifying", function () {
                                            expect(state.isModifying()).to.equal(false);
                                        });

                                        it("should fire the 'connected:entry' event", function () {
                                            expect(connectedEntrySpy.called).to.equal(true);
                                        });

                                        it("should fire the 'modifying:exit' event", function () {
                                            expect(modifyingExitSpy.called).to.equal(true);
                                        });
                                    });

                                    describe('invalid event', function () {
                                        var invalidEvents = [
                                            'initiate',
                                            'answer',
                                            'receiveLocalMedia',
                                            'approve',
                                            'sentOffer',
                                            'receiveRemoteMedia',
                                            'receiveAnswer',
                                            'modify'
                                        ];

                                        invalidEvents.forEach(function (evt) {
                                            describe("event " + evt, function () {
                                                var currentState;

                                                beforeEach(function () {
                                                    currentState = state.currentState().name;
                                                    state.dispatch(evt, params || {});
                                                });

                                                it("doesn't move to a new state", function () {
                                                    expect(state.currentState().name).to.equal(currentState);
                                                });

                                                it("should report modifying", function () {
                                                    expect(state.isModifying()).to.equal(true);
                                                });
                                            });
                                        });
                                    });
                                });

                                describe("as modify receiver", function () {
                                    var connectedExitSpy;
                                    var preparingEntrySpy;

                                    beforeEach(function () {
                                        connectedExitSpy = sinon.spy();
                                        preparingEntrySpy = sinon.spy();
                                        state.listen('connected:exit', connectedExitSpy);
                                        state.listen('preparing:entry', function () {
                                            preparingEntrySpy();
                                        });
                                        state.dispatch("modify", {receive: true});
                                    });

                                    afterEach(function () {
                                        state.ignore('connected:exit', connectedExitSpy);
                                        state.ignore('preparing:entry', preparingEntrySpy);
                                    });

                                    it("leads to 'preparing'", function () {
                                        expect(state.currentState().name).to.equal("preparing");
                                    });

                                    it("should report modifying", function () {
                                        expect(state.isModifying()).to.equal(true);
                                    });

                                    it("should fire the 'connected:exit' event", function () {
                                        expect(connectedExitSpy.called).to.equal(true);
                                    });

                                    it("should fire the 'preparing:entry' event", function () {
                                        expect(preparingEntrySpy.called).to.equal(true);
                                    });

                                    it("should set the caller to false", function () {
                                        expect(state.caller).to.equal(false);
                                    });

                                    describe("event 'reject'", function () {
                                        var connectedEntrySpy;
                                        var preparingExitSpy;

                                        beforeEach(function () {
                                            connectedEntrySpy = sinon.spy();
                                            preparingExitSpy = sinon.spy();
                                            state.listen('connected:entry', function () {
                                                connectedEntrySpy();
                                            });
                                            state.listen('preparing:exit', function () {
                                                preparingExitSpy();
                                            });
                                            state.dispatch("reject");
                                        });

                                        afterEach(function () {
                                            state.ignore('connected:entry', connectedEntrySpy);
                                            state.ignore('preparing:exit', preparingExitSpy);
                                        });

                                        it("leads to 'connected'", function () {
                                            expect(state.currentState().name).to.equal("connected");
                                        });

                                        it("should not report modifying", function () {
                                            expect(state.isModifying()).to.equal(false);
                                        });

                                        it("should fire the 'connected:entry' event", function () {
                                            expect(connectedEntrySpy.called).to.equal(true);
                                        });

                                        it("should fire the 'preparing:exit' event", function () {
                                            expect(preparingExitSpy.called).to.equal(true);
                                        });
                                    });

                                    describe('invalid event', function () {
                                        var invalidEvents = [
                                            'initiate',
                                            'receiveLocalMedia',
                                            'approve',
                                            'sentOffer',
                                            'receiveRemoteMedia',
                                            'receiveAnswer',
                                            'modify',
                                            'accept'
                                        ];

                                        invalidEvents.forEach(function (evt) {
                                            describe("event " + evt, function () {
                                                var currentState;

                                                beforeEach(function () {
                                                    currentState = state.currentState().name;
                                                    state.dispatch(evt, params || {});
                                                });

                                                it("doesn't move to a new state", function () {
                                                    expect(state.currentState().name).to.equal(currentState);
                                                });

                                                it("should report modifying", function () {
                                                    expect(state.isModifying()).to.equal(true);
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });

                describe("when a call listener is not attached", function () {
                    var terminatedEntrySpy;

                    beforeEach(function () {
                        terminatedEntrySpy = sinon.spy();
                        state.listen('terminated:entry', terminatedEntrySpy);
                        state.dispatch("initiate", {
                            client: {
                                hasListeners: function () { return false; }
                            }
                        });
                    });

                    afterEach(function () {
                        state.ignore('terminated:entry', terminatedEntrySpy);
                    });

                    it("leads to 'terminated'", function () {
                        expect(state.currentState().name).to.equal("terminated");
                    });

                    it("should not report modifying", function () {
                        expect(state.isModifying()).to.equal(false);
                    });

                    it("should fire the 'terminated:entry' event", function () {
                        expect(terminatedEntrySpy.called).to.equal(true);
                    });
                });
            });
        });
    });

    describe("for the callee", function () {
        describe("when starting from 'idle'", function () {
            var idleSpy;

            beforeEach(function () {
                params = {
                    caller: false,
                    receiveOnly: false,
                    directConnectionOnly: false,
                    previewLocalMedia: function () {},
                    approve: function () {}
                };
                state = respoke.CallState({caller: false});
            });

            it("reports the correct state name", function () {
                expect(state.currentState().name).to.equal("idle");
            });

            it("should not report modifying", function () {
                expect(state.isModifying()).to.equal(false);
            });

            describe("event 'hangup'", function () {
                var terminatedEntrySpy;

                beforeEach(function () {
                    terminatedEntrySpy = sinon.spy();
                    state.listen('terminated:entry', terminatedEntrySpy);
                    state.dispatch("hangup");
                });

                afterEach(function () {
                    state.ignore('terminated:entry', terminatedEntrySpy);
                });

                it("leads to 'terminated'", function () {
                    expect(state.currentState().name).to.equal("terminated");
                });

                it("should not report modifying", function () {
                    expect(state.isModifying()).to.equal(false);
                });

                it("should fire the 'terminated:entry' event", function () {
                    expect(terminatedEntrySpy.called).to.equal(true);
                });
            });

            describe('invalid event', function () {
                var invalidEvents = [
                    'reject',
                    'receiveLocalMedia',
                    'approve',
                    'answer',
                    'accept',
                    'sentOffer',
                    'receiveRemoteMedia',
                    'receiveAnswer',
                    'modify'
                ];

                invalidEvents.forEach(function (evt) {
                    describe("event " + evt, function () {
                        var currentState;

                        beforeEach(function () {
                            currentState = state.currentState().name;
                            state.dispatch(evt, params || {});
                        });

                        it("doesn't move to a new state", function () {
                            expect(state.currentState().name).to.equal(currentState);
                        });
                    });
                });
            });

            describe("event 'initiate'", function () {
                var preparingEntrySpy;

                beforeEach(function () {
                    preparingEntrySpy = sinon.spy();
                    state.listen('preparing:entry', preparingEntrySpy);
                    state.dispatch("initiate", {
                        client: {
                            hasListeners: function () { return true; }
                        }
                    });
                });

                afterEach(function () {
                    state.ignore('preparing:entry', preparingEntrySpy);
                });

                it("leads to 'preparing'", function () {
                    expect(state.currentState().name).to.equal("preparing");
                });

                it("should not report modifying", function () {
                    expect(state.isModifying()).to.equal(false);
                });

                it("should fire the 'preparing:entry' event", function () {
                    expect(preparingEntrySpy.called).to.equal(true);
                });

                describe("when isMediaFlowing is false", function () {
                    beforeEach(function () {
                        state.isMediaFlowing = false;
                    });

                    describe("event 'hangup'", function () {
                        var terminatedEntrySpy;

                        beforeEach(function () {
                            terminatedEntrySpy = sinon.spy();
                            state.listen('terminated:entry', terminatedEntrySpy);
                            state.dispatch("hangup");
                        });

                        afterEach(function () {
                            state.ignore('terminated:entry', terminatedEntrySpy);
                        });

                        it("leads to 'terminated'", function () {
                            expect(state.currentState().name).to.equal("terminated");
                        });

                        it("should not report modifying", function () {
                            expect(state.isModifying()).to.equal(false);
                        });

                        it("should fire the 'terminated:entry' event", function () {
                            expect(terminatedEntrySpy.called).to.equal(true);
                        });
                    });

                    describe('invalid event', function () {
                        var invalidEvents = [
                            'initiate',
                            'receiveLocalMedia',
                            'approve',
                            'accept',
                            'sentOffer',
                            'receiveRemoteMedia',
                            'receiveAnswer',
                            'modify'
                        ];

                        invalidEvents.forEach(function (evt) {
                            describe("event " + evt, function () {
                                var currentState;

                                beforeEach(function () {
                                    currentState = state.currentState().name;
                                    state.dispatch(evt, params || {});
                                });

                                it("doesn't move to a new state", function () {
                                    expect(state.currentState().name).to.equal(currentState);
                                });
                            });
                        });
                    });

                    describe("event 'reject'", function () {
                        var preparingExitSpy;
                        var terminatedEntrySpy;

                        beforeEach(function () {
                            preparingExitSpy = sinon.spy();
                            terminatedEntrySpy = sinon.spy();
                            state.listen('preparing:exit', preparingExitSpy);
                            state.listen('terminated:entry', terminatedEntrySpy);
                            state.dispatch("reject");
                        });

                        afterEach(function () {
                            state.ignore('preparing:exit', preparingExitSpy);
                            state.ignore('terminated:entry', terminatedEntrySpy);
                        });

                        it("leads to 'terminated'", function () {
                            expect(state.currentState().name).to.equal("terminated");
                        });

                        it("should not report modifying", function () {
                            expect(state.isModifying()).to.equal(false);
                        });

                        it("should fire the 'preparing:exit' event", function () {
                            expect(preparingExitSpy.called).to.equal(true);
                        });

                        it("should fire the 'terminated:entry' event", function () {
                            expect(terminatedEntrySpy.called).to.equal(true);
                        });

                        describe('invalid event', function () {
                            var invalidEvents = [
                                'initiate',
                                'reject',
                                'answer',
                                'receiveLocalMedia',
                                'approve',
                                'accept',
                                'sentOffer',
                                'receiveRemoteMedia',
                                'receiveAnswer',
                                'modify'
                            ];

                            invalidEvents.forEach(function (evt) {
                                describe("event " + evt, function () {
                                    var currentState;

                                    beforeEach(function () {
                                        currentState = state.currentState().name;
                                        state.dispatch(evt, params || {});
                                    });

                                    it("doesn't move to a new state", function () {
                                        expect(state.currentState().name).to.equal(currentState);
                                    });
                                });
                            });
                        });
                    });

                    describe("event 'answer'", function () {
                        var approvingDeviceAccessEntrySpy = sinon.spy();

                        beforeEach(function () {
                            state.listen('approving-device-access:entry', approvingDeviceAccessEntrySpy);
                            state.dispatch('answer', params);
                        });

                        afterEach(function () {
                            state.ignore('approving-device-access:entry', approvingDeviceAccessEntrySpy);
                        });

                        it("moves to 'approvingDeviceAccess'", function () {
                            expect(state.currentState().name).to.equal('approvingDeviceAccess');
                        });

                        it("fires 'approving-device-access:entry'", function () {
                            expect(approvingDeviceAccessEntrySpy.called).to.equal(true);
                        });

                        describe('invalid event', function () {
                            var invalidEvents = [
                                'initiate',
                                'answer',
                                'receiveLocalMedia',
                                'accept',
                                'sentOffer',
                                'receiveRemoteMedia',
                                'receiveAnswer',
                                'modify'
                            ];

                            invalidEvents.forEach(function (evt) {
                                describe("event " + evt, function () {
                                    var currentState;

                                    beforeEach(function () {
                                        currentState = state.currentState().name;
                                        state.dispatch(evt, params || {});
                                    });

                                    it("doesn't move to a new state", function () {
                                        expect(state.currentState().name).to.equal(currentState);
                                    });
                                });
                            });
                        });

                        describe("event 'reject'", function () {
                            beforeEach(function () {
                                state.dispatch("reject");
                            });

                            it("leads to 'terminated'", function () {
                                expect(state.currentState().name).to.equal("terminated");
                            });
                        });

                        describe("event 'approve'", function () {
                            var approvingContentEntrySpy;

                            beforeEach(function () {
                                approvingContentEntrySpy = sinon.spy();
                                state.listen('approving-content:entry', approvingContentEntrySpy);
                                state.dispatch('approve', params);
                            });

                            afterEach(function () {
                                state.ignore('approving-content:entry', approvingContentEntrySpy);
                            });

                            it("moves to 'approvingContent'", function () {
                                expect(state.currentState().name).to.equal('approvingContent');
                            });

                            it("fires 'approving-content:entry'", function () {
                                expect(approvingContentEntrySpy.called).to.equal(true);
                            });

                            describe('invalid event', function () {
                                var invalidEvents = [
                                    'initiate',
                                    'answer',
                                    'receiveLocalMedia',
                                    'approve',
                                    'accept',
                                    'sentOffer',
                                    'receiveRemoteMedia',
                                    'receiveAnswer',
                                    'modify'
                                ];

                                invalidEvents.forEach(function (evt) {
                                    describe("event " + evt, function () {
                                        var currentState;

                                        beforeEach(function () {
                                            currentState = state.currentState().name;
                                            state.dispatch(evt, params || {});
                                        });

                                        it("doesn't move to a new state", function () {
                                            expect(state.currentState().name).to.equal(currentState);
                                        });
                                    });
                                });
                            });

                            describe("event 'approve'", function () {
                                describe("when we have received local media already", function () {
                                    var connectingEntrySpy;

                                    beforeEach(function () {
                                        connectingEntrySpy = sinon.spy();
                                        state.listen('connecting:entry', connectingEntrySpy);
                                        state.dispatch('receiveLocalMedia', params);
                                        state.dispatch('approve', params);
                                    });

                                    afterEach(function () {
                                        state.ignore('connecting:entry', connectingEntrySpy);
                                    });

                                    it("moves to 'connecting'", function () {
                                        expect(state.currentState().name).to.equal('connecting');
                                    });

                                    it("fires 'connecting:entry'", function () {
                                        expect(connectingEntrySpy.called).to.equal(true);
                                    });

                                    describe('invalid event', function () {
                                        var invalidEvents = [
                                            'initiate',
                                            'answer',
                                            'receiveLocalMedia',
                                            'approve',
                                            'accept',
                                            'sentOffer',
                                            'receiveAnswer',
                                            'modify'
                                        ];

                                        invalidEvents.forEach(function (evt) {
                                            describe("event " + evt, function () {
                                                var currentState;

                                                beforeEach(function () {
                                                    currentState = state.currentState().name;
                                                    state.dispatch(evt, params || {});
                                                });

                                                it("doesn't move to a new state", function () {
                                                    expect(state.currentState().name).to.equal(currentState);
                                                });
                                            });
                                        });
                                    });

                                    describe("event 'receiveRemoteMedia'", function () {
                                        var connectedEntrySpy;

                                        beforeEach(function () {
                                            connectedEntrySpy = sinon.spy();
                                            state.listen('connected:entry', connectedEntrySpy);
                                            state.dispatch('receiveRemoteMedia');
                                        });

                                        afterEach(function () {
                                            state.ignore('connected:entry', connectedEntrySpy);
                                        });

                                        it("moves to 'connected'", function () {
                                            expect(state.currentState().name).to.equal('connected');
                                        });

                                        it("fires 'connected:entry'", function () {
                                            expect(connectedEntrySpy.called).to.equal(true);
                                        });

                                        describe('invalid event', function () {
                                            var invalidEvents = [
                                                'initiate',
                                                'answer',
                                                'receiveLocalMedia',
                                                'approve',
                                                'accept',
                                                'sentOffer',
                                                'receiveRemoteMedia',
                                                'receiveAnswer'
                                            ];

                                            invalidEvents.forEach(function (evt) {
                                                describe("event " + evt, function () {
                                                    var currentState;

                                                    beforeEach(function () {
                                                        currentState = state.currentState().name;
                                                        state.dispatch(evt, params || {});
                                                    });

                                                    it("doesn't move to a new state", function () {
                                                        expect(state.currentState().name).to.equal(currentState);
                                                    });
                                                });
                                            });
                                        });
                                    });

                                    describe("event 'reject'", function () {
                                        beforeEach(function () {
                                            state.dispatch("reject");
                                        });

                                        it("leads to 'terminated'", function () {
                                            expect(state.currentState().name).to.equal("terminated");
                                        });
                                    });
                                });

                                describe("when we have not received local media yet", function () {
                                    beforeEach(function () {
                                        expect(state.hasLocalMedia).to.equal(false);
                                        state.dispatch('approve', params);
                                    });

                                    it("does not change state", function () {
                                        expect(state.currentState().name).to.equal('approvingContent');
                                    });

                                    describe("event 'receiveLocalMedia'", function () {
                                        var connectingEntrySpy;

                                        beforeEach(function () {
                                            connectingEntrySpy = sinon.spy();
                                            state.listen('connecting:entry', connectingEntrySpy);
                                            state.dispatch('receiveLocalMedia', params);
                                        });

                                        afterEach(function () {
                                            state.ignore('connecting:entry', connectingEntrySpy);
                                        });

                                        it("moves to 'connecting'", function () {
                                            expect(state.currentState().name).to.equal('connecting');
                                        });

                                        it("fires 'connecting:entry'", function () {
                                            expect(connectingEntrySpy.called).to.equal(true);
                                        });

                                        describe('invalid event', function () {
                                            var invalidEvents = [
                                                'initiate',
                                                'answer',
                                                'receiveLocalMedia',
                                                'approve',
                                                'accept',
                                                'sentOffer',
                                                'receiveAnswer',
                                                'modify'
                                            ];

                                            invalidEvents.forEach(function (evt) {
                                                describe("event " + evt, function () {
                                                    var currentState;

                                                    beforeEach(function () {
                                                        currentState = state.currentState().name;
                                                        state.dispatch(evt, params || {});
                                                    });

                                                    it("doesn't move to a new state", function () {
                                                        expect(state.currentState().name).to.equal(currentState);
                                                    });
                                                });
                                            });
                                        });

                                        describe("event 'receiveRemoteMedia'", function () {
                                            var connectedEntrySpy;

                                            beforeEach(function () {
                                                connectedEntrySpy = sinon.spy();
                                                state.listen('connected:entry', connectedEntrySpy);
                                                state.dispatch('receiveRemoteMedia', params);
                                            });

                                            afterEach(function () {
                                                state.ignore('connected:entry', connectedEntrySpy);
                                            });

                                            it("moves to 'connected'", function () {
                                                expect(state.currentState().name).to.equal('connected');
                                            });

                                            it("fires 'connected:entry'", function () {
                                                expect(connectedEntrySpy.called).to.equal(true);
                                            });

                                            describe('invalid event', function () {
                                                var invalidEvents = [
                                                    'initiate',
                                                    'answer',
                                                    'receiveLocalMedia',
                                                    'approve',
                                                    'accept',
                                                    'sentOffer',
                                                    'receiveRemoteMedia',
                                                    'receiveAnswer'
                                                ];

                                                invalidEvents.forEach(function (evt) {
                                                    describe("event " + evt, function () {
                                                        var currentState;

                                                        beforeEach(function () {
                                                            currentState = state.currentState().name;
                                                            state.dispatch(evt, params || {});
                                                        });

                                                        it("doesn't move to a new state", function () {
                                                            expect(state.currentState().name).to.equal(currentState);
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });

                            describe("event 'reject'", function () {
                                beforeEach(function () {
                                    state.dispatch("reject");
                                });

                                it("leads to 'terminated'", function () {
                                    expect(state.currentState().name).to.equal("terminated");
                                });
                            });
                        });

                        describe("event 'reject'", function () {
                            beforeEach(function () {
                                state.dispatch("reject");
                            });

                            it("leads to 'terminated'", function () {
                                expect(state.currentState().name).to.equal("terminated");
                            });
                        });
                    });
                });

                describe("when isMediaFlowing is true", function () {
                    beforeEach(function () {
                        state.isMediaFlowing = true;
                    });

                    describe("event 'hangup'", function () {
                        var terminatedEntrySpy;

                        beforeEach(function () {
                            terminatedEntrySpy = sinon.spy();
                            state.listen('terminated:entry', terminatedEntrySpy);
                            state.dispatch("hangup");
                        });

                        afterEach(function () {
                            state.ignore('terminated:entry', terminatedEntrySpy);
                        });

                        it("leads to 'terminated'", function () {
                            expect(state.currentState().name).to.equal("terminated");
                        });

                        it("should not report modifying", function () {
                            expect(state.isModifying()).to.equal(false);
                        });

                        it("should fire the 'terminated:entry' event", function () {
                            expect(terminatedEntrySpy.called).to.equal(true);
                        });
                    });

                    describe("event 'reject'", function () {
                        var connectedEntrySpy;

                        beforeEach(function () {
                            connectedEntrySpy = sinon.spy();
                            state.listen('connected:entry', connectedEntrySpy);
                            state.dispatch("reject");
                        });

                        afterEach(function () {
                            state.ignore('connected:entry', connectedEntrySpy);
                        });

                        it("leads to 'connected'", function () {
                            expect(state.currentState().name).to.equal("connected");
                        });

                        it("should not report modifying", function () {
                            expect(state.isModifying()).to.equal(false);
                        });

                        it("should fire the 'connected:entry' event", function () {
                            expect(connectedEntrySpy.called).to.equal(true);
                        });

                        describe("event 'modify'", function () {
                            describe("as modify sender", function () {
                                var connectedExitSpy;
                                var modifyingEntrySpy;

                                beforeEach(function () {
                                    connectedExitSpy = sinon.spy();
                                    modifyingEntrySpy = sinon.spy();
                                    state.listen('connected:exit', connectedExitSpy);
                                    state.listen('modifying:entry', function () {
                                        modifyingEntrySpy();
                                    });
                                    state.dispatch("modify");
                                });

                                afterEach(function () {
                                    state.ignore('connected:exit', connectedExitSpy);
                                    state.ignore('modifying:entry', modifyingEntrySpy);
                                });

                                it("leads to 'modifying'", function () {
                                    expect(state.currentState().name).to.equal("modifying");
                                });

                                it("should report modifying", function () {
                                    expect(state.isModifying()).to.equal(true);
                                });

                                it("should fire the 'connected:exit' event", function () {
                                    expect(connectedExitSpy.called).to.equal(true);
                                });

                                it("should fire the 'modifying:entry' event", function () {
                                    expect(modifyingEntrySpy.called).to.equal(true);
                                });

                                describe("event 'accept'", function () {
                                    var preparingEntrySpy;
                                    var modifyingExitSpy;

                                    beforeEach(function () {
                                        preparingEntrySpy = sinon.spy();
                                        modifyingExitSpy = sinon.spy();
                                        state.listen('preparing:entry', function () {
                                            preparingEntrySpy();
                                        });
                                        state.listen('modifying:exit', function () {
                                            modifyingExitSpy();
                                        });
                                        state.dispatch("accept");
                                    });

                                    afterEach(function () {
                                        state.ignore('preparing:entry', preparingEntrySpy);
                                        state.ignore('modifying:exit', modifyingExitSpy);
                                    });

                                    it("leads to 'preparing'", function () {
                                        expect(state.currentState().name).to.equal("preparing");
                                    });

                                    it("should report modifying", function () {
                                        expect(state.isModifying()).to.equal(true);
                                    });

                                    it("should fire the 'preparing:entry' event", function () {
                                        expect(preparingEntrySpy.called).to.equal(true);
                                    });

                                    it("should fire the 'modifying:exit' event", function () {
                                        expect(modifyingExitSpy.called).to.equal(true);
                                    });

                                    it("should set hasLocalMediaApproval to false", function () {
                                        expect(state.hasLocalMediaApproval).to.equal(false);
                                    });

                                    it("should set hasLocalMedia to false", function () {
                                        expect(state.hasLocalMedia).to.equal(false);
                                    });

                                    it("should set caller to true", function () {
                                        expect(state.caller).to.equal(true);
                                    });
                                });

                                describe("event 'reject'", function () {
                                    var connectedEntrySpy;
                                    var modifyingExitSpy;

                                    beforeEach(function () {
                                        connectedEntrySpy = sinon.spy();
                                        modifyingExitSpy = sinon.spy();
                                        state.listen('connected:entry', function () {
                                            connectedEntrySpy();
                                        });
                                        state.listen('modifying:exit', function () {
                                            modifyingExitSpy();
                                        });
                                        state.dispatch("reject");
                                    });

                                    afterEach(function () {
                                        state.ignore('connected:entry', connectedEntrySpy);
                                        state.ignore('modifying:exit', modifyingExitSpy);
                                    });

                                    it("leads to 'connected'", function () {
                                        expect(state.currentState().name).to.equal("connected");
                                    });

                                    it("should not report modifying", function () {
                                        expect(state.isModifying()).to.equal(false);
                                    });

                                    it("should fire the 'connected:entry' event", function () {
                                        expect(connectedEntrySpy.called).to.equal(true);
                                    });

                                    it("should fire the 'modifying:exit' event", function () {
                                        expect(modifyingExitSpy.called).to.equal(true);
                                    });
                                });

                                describe('invalid event', function () {
                                    var invalidEvents = [
                                        'initiate',
                                        'answer',
                                        'receiveLocalMedia',
                                        'approve',
                                        'sentOffer',
                                        'receiveRemoteMedia',
                                        'receiveAnswer',
                                        'modify'
                                    ];

                                    invalidEvents.forEach(function (evt) {
                                        describe("event " + evt, function () {
                                            var currentState;

                                            beforeEach(function () {
                                                currentState = state.currentState().name;
                                                state.dispatch(evt, params || {});
                                            });

                                            it("doesn't move to a new state", function () {
                                                expect(state.currentState().name).to.equal(currentState);
                                            });

                                            it("should report modifying", function () {
                                                expect(state.isModifying()).to.equal(true);
                                            });
                                        });
                                    });
                                });
                            });

                            describe("as modify receiver", function () {
                                var connectedExitSpy;
                                var preparingEntrySpy;

                                beforeEach(function () {
                                    connectedExitSpy = sinon.spy();
                                    preparingEntrySpy = sinon.spy();
                                    state.listen('connected:exit', connectedExitSpy);
                                    state.listen('preparing:entry', function () {
                                        preparingEntrySpy();
                                    });
                                    state.dispatch("modify", {receive: true});
                                });

                                afterEach(function () {
                                    state.ignore('connected:exit', connectedExitSpy);
                                    state.ignore('preparing:entry', preparingEntrySpy);
                                });

                                it("leads to 'preparing'", function () {
                                    expect(state.currentState().name).to.equal("preparing");
                                });

                                it("should report modifying", function () {
                                    expect(state.isModifying()).to.equal(true);
                                });

                                it("should fire the 'connected:exit' event", function () {
                                    expect(connectedExitSpy.called).to.equal(true);
                                });

                                it("should fire the 'preparing:entry' event", function () {
                                    expect(preparingEntrySpy.called).to.equal(true);
                                });

                                it("should set the caller to false", function () {
                                    expect(state.caller).to.equal(false);
                                });

                                describe("event 'reject'", function () {
                                    var connectedEntrySpy;
                                    var preparingExitSpy;

                                    beforeEach(function () {
                                        connectedEntrySpy = sinon.spy();
                                        preparingExitSpy = sinon.spy();
                                        state.listen('connected:entry', function () {
                                            connectedEntrySpy();
                                        });
                                        state.listen('preparing:exit', function () {
                                            preparingExitSpy();
                                        });
                                        state.dispatch("reject");
                                    });

                                    afterEach(function () {
                                        state.ignore('connected:entry', connectedEntrySpy);
                                        state.ignore('preparing:exit', preparingExitSpy);
                                    });

                                    it("leads to 'connected'", function () {
                                        expect(state.currentState().name).to.equal("connected");
                                    });

                                    it("should not report modifying", function () {
                                        expect(state.isModifying()).to.equal(false);
                                    });

                                    it("should fire the 'connected:entry' event", function () {
                                        expect(connectedEntrySpy.called).to.equal(true);
                                    });

                                    it("should fire the 'preparing:exit' event", function () {
                                        expect(preparingExitSpy.called).to.equal(true);
                                    });
                                });

                                describe('invalid event', function () {
                                    var invalidEvents = [
                                        'initiate',
                                        'receiveLocalMedia',
                                        'approve',
                                        'sentOffer',
                                        'receiveRemoteMedia',
                                        'receiveAnswer',
                                        'accept'
                                    ];

                                    invalidEvents.forEach(function (evt) {
                                        describe("event " + evt, function () {
                                            var currentState;

                                            beforeEach(function () {
                                                currentState = state.currentState().name;
                                                state.dispatch(evt, params || {});
                                            });

                                            it("doesn't move to a new state", function () {
                                                expect(state.currentState().name).to.equal(currentState);
                                            });

                                            it("should report modifying", function () {
                                                expect(state.isModifying()).to.equal(true);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

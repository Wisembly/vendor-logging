var portableSendClickEvent = function (element) {

    document.body.appendChild(element);

    if (element.fireEvent) {

        element.click();

    } else if (document.createEvent) {

        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
        element.dispatchEvent(event);

    } else {

        var event = new Event('click');
        element.dispatchEvent(event);

    }

};

QUnit.test('it should catch errors dispatched in DOM events', function (assert) {

    assert.willLog(function (throwAction) {

        var element = document.createElement('div');
        document.body.appendChild(element);

        element.addEventListener('click', throwAction);
        portableSendClickEvent(element);

    });

    assert.willLog(function (throwAction) {

        var element = document.createElement('div');

        element.onclick = throwAction;
        portableSendClickEvent(element);

    });

});

QUnit.test('it should catch errors dispatched in timeout', function (assert) {

    assert.willLog(function (throwAction) {
        window.setTimeout(throwAction);
    });

    assert.willLog(function (throwAction) {
        setTimeout(throwAction);
    });

});

QUnit.test('it should catch errors dispatched in intervals', function (assert) {

    var interval1, interval2;

    assert.willLog(function (throwAction) {
        interval1 = window.setInterval(throwAction, 100);
    }, function () {
        clearInterval(interval1);
    });

    assert.willLog(function (throwAction) {
        interval2 = setInterval(throwAction, 100);
    }, function () {
        clearInterval(interval2);
    });

});

QUnit.test('it should catch errors dispatched in animation frames', function (assert) {

    if (!window.requestAnimationFrame)
        return assert.expect(0);

    assert.willLog(function (throwAction) {
        window.requestAnimationFrame(throwAction);
    });

    assert.willLog(function (throwAction) {
        requestAnimationFrame(throwAction);
    });

});

QUnit.test('it should catch errors dispatched in XHR callbacks', function (assert) {

    assert.willLog(function (throwAction) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '?', false);

        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState === 4) throwAction();
        });

        xhr.send(null);

    });

    assert.willLog(function (throwAction) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '?', false);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) throwAction();
        };

        xhr.send(null);

    });

});

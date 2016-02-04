(function () {

    var logHistory = [];

    QUnit.extend(QUnit.assert, {

        willLog: function (execBlock, doneBlock) {

            var done = this.async();

            logHistory.length = 0;

            execBlock(function () {

                window.setTimeout(function () {
                    this.ok(logHistory.length > 0, 'A log should have been catched');
                    doneBlock && doneBlock();
                    done();
                });

                throw new Error();

            });

        }

    });

    window.logging = new WisemblyLogging(true);
    window.logging.captureException = function (){logHistory.push(arguments);};
    window.logging.rethrowError = function(){};

})();

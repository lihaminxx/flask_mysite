def a():
    print("i'm a student")
    def read():
        print("i'm reading")


c = a
a().read()
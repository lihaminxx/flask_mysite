import sqlite3
con = sqlite3.connect('flask_site.db')
cur = con.cursor()
cur.execute("Drop table issues")
cur.execute('''CREATE TABLE issues
               ('No.' text, CreateTime text, Type text, Title text, Priority text, Status text, Progress text ,Owner text)''')
cur.execute("INSERT INTO issues VALUES ('1','20211101','Task','etsetset','Low','Open','202112:123123asdfasdfadf','Lihanmin')")
cur.execute("select * from issues")
con.commit()
con.close()

for row in cur.execute('SELECT * FROM issues order by No.'):
    print(row)
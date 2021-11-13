
"""
把一个up主自己的网站内容爬下来

https://xiangjianan.gitee.io/lks/
"""
from requests_html import HTMLSession
import requests

sessoin = HTMLSession()
sessoin
a = requests.get('https://xiangjianan.gitee.io/lks/').content

c = str(a,'utf-8')


f = open(r'./cc1.html','w')
f.write(c)
f.close()


#!/usr/bin/env python
from setuptools import setup, find_packages

with open("README.md", "r") as fh:
    README = fh.read()

setup(
    name='safbi',
    version='0.0.1',
    description='System Analysis for Business Intelligence',
    long_description=README,
    long_description_content_type="text/markdown",
    url='https://github.com/sergiotocalini/safbi',
    license='GNU GPLv3', 
    author='Sergio Tocalini Joerg',
    author_email='sergiotocalini@gmail.com',
    packages=[],
    classifiers=[
       'Programming Language :: Python'
    ],
)
